import 'reflect-metadata';
import http from 'http';
import app from './app';
import { config } from './config';
import { initDatabase } from './database/mongodb/connection';
// import { initRedis } from './database/redis/connection'; // DISABLED: Redis not required for MVP phase
import { SocketGateway } from './websocket/socket.gateway';
import { container } from './dependency_injection/container';
import { TYPES } from './dependency_injection/types';
import { ISocketService } from './services/common/socket.service';
import { ILoggerService } from './services/common/logger.service';

const startServer = async () => {
  const logger = container.get<ILoggerService>(TYPES.LoggerService);

  try {
    // 1. Initialize databases
    await initDatabase();
    // initRedis(); // DISABLED: Redis not required for MVP phase

    // 2. Setup server & socket.io
    const server = http.createServer(app);
    const socketGateway = new SocketGateway(server);

    // 3. Inject socket.io instance into SocketService
    const socketService = container.get<ISocketService>(TYPES.SocketService);
    socketService.setIo(socketGateway.getIo());

    // 4. Start listening
    const port = config.app.port;
    server.listen(port, () => {
      logger.info(`Server started successfully on port ${port} in ${config.app.env} mode.`);
      logger.info(`API Gateway routes mounted at http://localhost:${port}${config.app.apiPrefix}`);
      logger.info(`WebSocket Gateway online and waiting for clients.`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.warn(`Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Fatal crash occurred during application startup.', error);
    process.exit(1);
  }
};

startServer();
