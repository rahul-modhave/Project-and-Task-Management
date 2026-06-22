import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { BaseRepository } from '../../../repositories/base.repository';
import { UserEntity, UserEntityDocument } from '../entity/user.entity';
import { IUserEntityRepository } from '../interface/user-entity.repository.interface';

@injectable()
export class UserEntityRepository extends BaseRepository<UserEntityDocument> implements IUserEntityRepository {
    constructor() {
        super(UserEntity);
    }

    async findByEmail(email: string): Promise<UserEntityDocument | null> {
        return await this.findOne({ email: email.toLowerCase() });
    }

    async ensureCollectionExists(): Promise<void> {

        // Check if collection exists
        const collections = await mongoose.connection.db!.listCollections({ name: 'users' }).toArray();

        if (collections.length === 0) {
            // Collection doesn't exist, create it by inserting and removing a dummy document
            // This ensures indexes are created
            await mongoose.connection.db!.createCollection('users');
            console.log('Created "users" collection');
        } else {
            console.log('"users" collection already exists');
        }
    }

    async getAllUsers(): Promise<UserEntityDocument[]> {
        return await this.findAll({ deletedAt: null });
    }
}
