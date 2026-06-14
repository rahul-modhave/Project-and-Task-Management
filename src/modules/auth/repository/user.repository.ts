import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { User, UserDocument } from '../entity/user.entity';
import { IUserRepository } from '../interface/user.repository.interface';

@injectable()
export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findByIds(ids: string[]): Promise<UserDocument[]> {
    return await this.findAll({ _id: { $in: ids }, deletedAt: null });
  }
}
