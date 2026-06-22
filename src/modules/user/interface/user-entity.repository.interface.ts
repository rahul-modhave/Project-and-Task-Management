import { IBaseRepository } from '../../../repositories/base.repository';
import { UserEntityDocument } from '../entity/user.entity';

export interface IUserEntityRepository extends IBaseRepository<UserEntityDocument> {
    findByEmail(email: string): Promise<UserEntityDocument | null>;
    ensureCollectionExists(): Promise<void>;
    getAllUsers(): Promise<UserEntityDocument[]>;
}
