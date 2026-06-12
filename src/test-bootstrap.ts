import 'reflect-metadata';
import { container } from './dependency_injection/container';
import { TYPES } from './dependency_injection/types';

console.log('--- CollabFlow Dependency Injection Verification ---');

try {
  const logger = container.get<any>(TYPES.LoggerService);
  console.log(`✔ LoggerService resolved: ${logger.constructor.name}`);

  const email = container.get<any>(TYPES.EmailService);
  console.log(`✔ EmailService resolved: ${email.constructor.name}`);

  const token = container.get<any>(TYPES.TokenService);
  console.log(`✔ TokenService resolved: ${token.constructor.name}`);

  const socket = container.get<any>(TYPES.SocketService);
  console.log(`✔ SocketService resolved: ${socket.constructor.name}`);

  const userRepo = container.get<any>(TYPES.UserRepository);
  console.log(`✔ UserRepository resolved: ${userRepo.constructor.name}`);

  const sessionRepo = container.get<any>(TYPES.SessionRepository);
  console.log(`✔ SessionRepository resolved: ${sessionRepo.constructor.name}`);

  const taskRepo = container.get<any>(TYPES.TaskRepository);
  console.log(`✔ TaskRepository resolved: ${taskRepo.constructor.name}`);

  const authService = container.get<any>(TYPES.AuthService);
  console.log(`✔ AuthService resolved: ${authService.constructor.name}`);

  const taskService = container.get<any>(TYPES.TaskService);
  console.log(`✔ TaskService resolved: ${taskService.constructor.name}`);

  const authController = container.get<any>(TYPES.AuthController);
  console.log(`✔ AuthController resolved: ${authController.constructor.name}`);

  const taskController = container.get<any>(TYPES.TaskController);
  console.log(`✔ TaskController resolved: ${taskController.constructor.name}`);

  console.log('\n✔ Verification succeeded: All dependencies in the InversifyJS container resolve correctly.');
  process.exit(0);
} catch (err) {
  console.error('\n✘ DI Verification failed:', err);
  process.exit(1);
}
