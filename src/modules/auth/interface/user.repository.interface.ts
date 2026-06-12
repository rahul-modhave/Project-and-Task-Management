import { IBaseRepository } from '../../../repositories/base.repository';
import { UserDocument } from '../entity/user.entity';

export interface IUserRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
