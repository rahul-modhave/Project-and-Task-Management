import { injectable } from 'inversify';
import { Server } from 'socket.io';

export interface ISocketService {
  setIo(io: Server): void;
  emitToUser(userId: string, event: string, payload: any): void;
  emitToRoom(roomName: string, event: string, payload: any): void;
  broadcast(event: string, payload: any): void;
}

@injectable()
export class SocketService implements ISocketService {
  private io: Server | null = null;

  public setIo(io: Server): void {
    this.io = io;
  }

  public emitToUser(userId: string, event: string, payload: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, payload);
  }

  public emitToRoom(roomName: string, event: string, payload: any): void {
    if (!this.io) return;
    this.io.to(roomName).emit(event, payload);
  }

  public broadcast(event: string, payload: any): void {
    if (!this.io) return;
    this.io.emit(event, payload);
  }
}
