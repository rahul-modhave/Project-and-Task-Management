import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { IAuthService } from '../service/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {
    super();
  }

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as SignupDto;
      const result = await this.authService.signup(dto);
      
      // Exclude password hash from response
      const { passwordHash: _, ...userWithoutPassword } = result.user;

      this.sendCreated(res, {
        user: userWithoutPassword,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'User registered successfully');
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const result = await this.authService.login(dto);

      const { passwordHash: _, ...userWithoutPassword } = result.user;

      this.sendSuccess(res, {
        user: userWithoutPassword,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'Login successful');
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      this.sendSuccess(res, result, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
      }

      await this.authService.logout(refreshToken);
      res.status(204).send(); // 204 No Content
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      this.sendSuccess(res, userWithoutPassword, 'Current user profile fetched');
    } catch (err) {
      next(err);
    }
  };
}
