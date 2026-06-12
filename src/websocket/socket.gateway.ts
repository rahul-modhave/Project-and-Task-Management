import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class SocketGateway {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: config.app.corsOrigins,
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupConnection();
  }

  public getIo(): Server {
    return this.io;
  }

  private setupMiddleware(): void {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      try {
        const decoded = jwt.verify(token as string, config.jwt.accessSecret) as {
          userId: string;
          email: string;
        };
        socket.data.user = decoded;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupConnection(): void {
    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user;
      console.log(`WebSocket client connected: ${socket.id} (User: ${user.userId})`);

      // Auto-join personal user room for targeted notifications
      socket.join(`user:${user.userId}`);

      // 1. Presence management: Online
      this.io.emit('presence:changed', { userId: user.userId, status: 'online' });

      // Join Workspace
      socket.on('workspace:join', (workspaceId: string) => {
        socket.join(`workspace:${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
      });

      // Join Channel (for team chat)
      socket.on('channel:join', (channelId: string) => {
        socket.join(`channel:${channelId}`);
        console.log(`Socket ${socket.id} joined channel:${channelId}`);
      });

      // Leave Channel
      socket.on('channel:leave', (channelId: string) => {
        socket.leave(`channel:${channelId}`);
        console.log(`Socket ${socket.id} left channel:${channelId}`);
      });

      // Join Project (for Kanban updates)
      socket.on('project:join', (projectId: string) => {
        socket.join(`project:${projectId}`);
        console.log(`Socket ${socket.id} joined project:${projectId}`);
      });

      // Typing indicators
      socket.on('typing:start', (data: { channelId: string }) => {
        socket.to(`channel:${data.channelId}`).emit('typing:changed', {
          channelId: data.channelId,
          userId: user.userId,
          username: user.email, // can enrich later with user metadata
          isTyping: true,
        });
      });

      socket.on('typing:stop', (data: { channelId: string }) => {
        socket.to(`channel:${data.channelId}`).emit('typing:changed', {
          channelId: data.channelId,
          userId: user.userId,
          isTyping: false,
        });
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id} (User: ${user.userId})`);
        this.io.emit('presence:changed', { userId: user.userId, status: 'offline' });
      });
    });
  }
}
