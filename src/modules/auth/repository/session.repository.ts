import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { Session, SessionDocument } from '../entity/session.entity';
import { ISessionRepository } from '../interface/session.repository.interface';

@injectable()
export class SessionRepository extends BaseRepository<SessionDocument> implements ISessionRepository {
  constructor() {
    super(Session);
  }

  async findByToken(token: string): Promise<SessionDocument | null> {
    return await this.findOne({ refreshToken: token });
  }

  async revokeSession(token: string): Promise<boolean> {
    const session = await this.findByToken(token);
    if (!session) return false;

    // Revoke the session by setting revokedAt to current time
    session.revokedAt = new Date();
    await this.save(session);
    return true;
  }
}
