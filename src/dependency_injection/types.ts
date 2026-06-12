export const TYPES = {
  // Config
  Config: Symbol.for('Config'),

  // Infrastructure Services
  LoggerService: Symbol.for('LoggerService'),
  CacheService: Symbol.for('CacheService'),
  EmailService: Symbol.for('EmailService'),
  TokenService: Symbol.for('TokenService'),
  SocketService: Symbol.for('SocketService'),

  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  TaskRepository: Symbol.for('TaskRepository'),
  UserEntityRepository: Symbol.for('UserEntityRepository'),

  // Business Services
  AuthService: Symbol.for('AuthService'),
  TaskService: Symbol.for('TaskService'),
  UserService: Symbol.for('UserService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  TaskController: Symbol.for('TaskController'),
  UserController: Symbol.for('UserController'),

  // Health
  HealthService: Symbol.for('HealthService'),
  HealthController: Symbol.for('HealthController'),
};
