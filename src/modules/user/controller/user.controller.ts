import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { IUserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@injectable()
export class UserController extends BaseController {
    constructor(
        @inject(TYPES.UserService) private userService: IUserService
    ) {
        super();
    }

    public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto: CreateUserDto = req.body;

            const user = await this.userService.createUser(dto);

            // Return user without passwordHash
            const userResponse = {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                isVerified: user.isVerified,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            this.sendSuccess(res, userResponse, 'User created successfully', 201);
        } catch (err) {
            next(err);
        }
    };
}
