import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { TYPES } from '../../../dependency_injection/types';
import { IUserEntityRepository } from '../interface/user-entity.repository.interface';
import { ILoggerService } from '../../../services/common/logger.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntityDocument } from '../entity/user.entity';
import { AppError } from '../../../common/errors/app-error';

export interface IUserService {
    createUser(dto: CreateUserDto): Promise<UserEntityDocument>;
}

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.UserEntityRepository) private userRepository: IUserEntityRepository,
        @inject(TYPES.LoggerService) private logger: ILoggerService
    ) { }

    async createUser(dto: CreateUserDto): Promise<UserEntityDocument> {
        try {
            // Ensure the users collection exists
            await this.userRepository.ensureCollectionExists();

            // Check if user with this email already exists
            const existingUser = await this.userRepository.findByEmail(dto.email);
            if (existingUser) {
                throw AppError.conflict('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(dto.password, salt);

            // Create the user
            const newUser = await this.userRepository.create({
                email: dto.email.toLowerCase(),
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                avatar: dto.avatar || null,
                isVerified: dto.isVerified || false,
                lastLoginAt: null,
            });

            this.logger.info(`User created successfully: ${newUser.email}`);

            return newUser;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error('Error creating user', error);
            throw AppError.internal('Failed to create user', 'USER_CREATION_FAILED');
        }
    }
}
