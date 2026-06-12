import { IBaseRepository } from '../../../repositories/base.repository';
import { SessionDocument } from '../entity/session.entity';

export interface ISessionRepository extends IBaseRepository<SessionDocument> {
  findByToken(token: string): Promise<SessionDocument | null>;
  revokeSession(token: string): Promise<boolean>;
}
