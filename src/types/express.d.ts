import { User } from '../modules/auth/entity/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
