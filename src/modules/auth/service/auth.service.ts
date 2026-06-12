import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { TYPES } from '../../../dependency_injection/types';
import { IUserRepository } from '../interface/user.repository.interface';
import { ISessionRepository } from '../interface/session.repository.interface';
import { ITokenService } from '../../../services/common/token.service';
import { IEmailService } from '../../../services/common/email.service';
import { ILoggerService } from '../../../services/common/logger.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { UserDocument, UserStatus } from '../entity/user.entity';
import { AppError } from '../../../common/errors/app-error';

export interface IAuthService {
  signup(dto: SignupDto): Promise<{ user: UserDocument; accessToken: string; refreshToken: string }>;
  login(dto: LoginDto): Promise<{ user: UserDocument; accessToken: string; refreshToken: string }>;
  refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(token: string): Promise<void>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.SessionRepository) private sessionRepository: ISessionRepository,
    @inject(TYPES.TokenService) private tokenService: ITokenService,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  async signup(dto: SignupDto): Promise<{ user: UserDocument; accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw AppError.conflict('Email already registered', 'EMAIL_ALREADY_REGISTERED');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const savedUser = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });

    this.logger.info(`User registered successfully: ${savedUser.email}`);

    // Trigger confirmation email asynchronously
    const verificationToken = uuidv4();
    this.emailService.sendVerificationEmail(savedUser.email, verificationToken).catch((err) => {
      this.logger.error(`Error sending email to ${savedUser.email}`, err);
    });

    const tokens = await this.createSession(savedUser);
    return {
      user: savedUser,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserDocument; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || user.status === UserStatus.DELETED) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw AppError.forbidden('Your account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.createSession(user);
    this.logger.info(`User logged in: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded: { userId: string };
    try {
      decoded = this.tokenService.verifyRefreshToken(token);
    } catch (err) {
      throw AppError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const session = await this.sessionRepository.findByToken(token);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw AppError.unauthorized('Session has been revoked or expired', 'SESSION_EXPIRED');
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized('User is no longer active', 'USER_INACTIVE');
    }

    const userId = user._id.toString();

    // Generate new token pair
    const accessToken = this.tokenService.generateAccessToken({
      userId,
      email: user.email,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken({
      userId,
    });

    // Rotate refresh token (revoke old, save new)
    session.revokedAt = new Date();
    await this.sessionRepository.save(session);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching JWT configuration

    await this.sessionRepository.create({
      userId: user._id,
      refreshToken: newRefreshToken,
      accessTokenJti: uuidv4(),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    const revoked = await this.sessionRepository.revokeSession(token);
    if (!revoked) {
      throw AppError.notFound('Session not found', 'SESSION_NOT_FOUND');
    }
  }

  private async createSession(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = user._id.toString();

    const accessToken = this.tokenService.generateAccessToken({
      userId,
      email: user.email,
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      userId,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.sessionRepository.create({
      userId: user._id,
      refreshToken,
      accessTokenJti: uuidv4(),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
