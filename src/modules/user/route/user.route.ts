import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { UserController } from '../controller/user.controller';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import { CreateUserDto } from '../dto/create-user.dto';

const router = Router();

const getController = (): UserController => {
    return container.get<UserController>(TYPES.UserController);
};

// POST /api/v1/users - Create a new user
router.post('/', validationMiddleware(CreateUserDto), (req, res, next) => {
    getController().createUser(req, res, next);
});

router.get('/getAllUsers', (req, res, next) => {
    getController().getAllUsers(req, res, next);
});


export default router;
