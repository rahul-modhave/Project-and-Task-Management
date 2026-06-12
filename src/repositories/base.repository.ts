import { Model, Document, QueryFilter, UpdateQuery } from 'mongoose';
import { injectable, unmanaged } from 'inversify';

// ------------------------------------------------------------------
// Generic interface — same contract as before so services/controllers
// are completely unaffected by the switch to MongoDB.
// ------------------------------------------------------------------
export interface IBaseRepository<T> {
  create(item: Partial<T>): Promise<T>;
  save(item: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>): Promise<T | null>;
  findAll(filter?: QueryFilter<T>): Promise<T[]>;
  update(id: string, item: UpdateQuery<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

@injectable()
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(@unmanaged() model: Model<T>) {
    this.model = model;
  }

  async create(item: Partial<T>): Promise<T> {
    const doc = new this.model(item);
    return (await doc.save()) as T;
  }

  // For Mongoose, save() is used after mutating an existing document
  async save(item: T): Promise<T> {
    return (await item.save()) as T;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findAll(filter: QueryFilter<T> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async update(id: string, item: UpdateQuery<T>): Promise<boolean> {
    const result = await this.model.updateOne({ _id: id }, item).exec();
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
