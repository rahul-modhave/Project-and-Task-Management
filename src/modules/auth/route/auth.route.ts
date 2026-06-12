import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { AuthController } from '../controller/auth.controller';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

const router = Router();

// Lazy resolve AuthController to prevent circular container issues
const getController = (): AuthController => {
  return container.get<AuthController>(TYPES.AuthController);
};

router.post('/signup', validationMiddleware(SignupDto), (req, res, next) => {
  getController().signup(req, res, next);
});

router.post('/login', validationMiddleware(LoginDto), (req, res, next) => {
  getController().login(req, res, next);
});

router.post('/refresh', (req, res, next) => {
  getController().refresh(req, res, next);
});

router.post('/logout', (req, res, next) => {
  getController().logout(req, res, next);
});

router.get('/me', authMiddleware, (req, res, next) => {
  getController().me(req, res, next);
});

export default router;
