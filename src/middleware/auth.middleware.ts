import { Request, Response, NextFunction } from 'express';
import { container } from '../dependency_injection/container';
import { TYPES } from '../dependency_injection/types';
import { ITokenService } from '../services/common/token.service';
import { IUserRepository } from '../modules/auth/interface/user.repository.interface';
import { AppError } from '../common/errors/app-error';
import { UserStatus } from '../modules/auth/entity/user.entity';


export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(AppError.unauthorized('Access token is missing or invalid', 'TOKEN_MISSING'));
      return;
    }

    const token = authHeader.split(' ')[1];
    
    let tokenService: ITokenService;
    let userRepository: IUserRepository;
    
    try {
      tokenService = container.get<ITokenService>(TYPES.TokenService);
      userRepository = container.get<IUserRepository>(TYPES.UserRepository);
    } catch (err) {
      next(AppError.internal('Internal server DI error', 'DI_ERROR'));
      return;
    }

    let decoded: { userId: string; email: string };
    try {
      decoded = tokenService.verifyAccessToken(token);
    } catch (err) {
      next(AppError.unauthorized('Access token has expired or is invalid', 'INVALID_TOKEN'));
      return;
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status === UserStatus.DELETED) {
      next(AppError.unauthorized('User account no longer exists', 'USER_NOT_FOUND'));
      return;
    }

    if (user.status === UserStatus.SUSPENDED) {
      next(AppError.forbidden('Your account has been suspended', 'ACCOUNT_SUSPENDED'));
      return;
    }

    // Assign user to request object
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
