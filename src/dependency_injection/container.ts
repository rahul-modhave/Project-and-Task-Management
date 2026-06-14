import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Import Services & Implementations
import { ILoggerService, LoggerService } from '../services/common/logger.service';
import { ICacheService, CacheService } from '../services/common/cache.service';
import { IEmailService, EmailService } from '../services/common/email.service';
import { ITokenService, TokenService } from '../services/common/token.service';
import { ISocketService, SocketService } from '../services/common/socket.service';

// Import Repositories
import { IUserRepository } from '../modules/auth/interface/user.repository.interface';
import { UserRepository } from '../modules/auth/repository/user.repository';
import { ISessionRepository } from '../modules/auth/interface/session.repository.interface';
import { SessionRepository } from '../modules/auth/repository/session.repository';
import { ITaskRepository } from '../modules/task/interface/task.repository.interface';
import { TaskRepository } from '../modules/task/repository/task.repository';
import { IProjectRepository } from '../modules/project/interface/project.repository.interface';
import { ProjectRepository } from '../modules/project/repository/project.repository';
import { IProjectMemberRepository } from '../modules/project/interface/project-member.repository.interface';
import { ProjectMemberRepository } from '../modules/project/repository/project-member.repository';

// Import Business Logic Services
import { IAuthService, AuthService } from '../modules/auth/service/auth.service';
import { ITaskService, TaskService } from '../modules/task/service/task.service';
import { IProjectService, ProjectService } from '../modules/project/service/project.service';
import { IDashboardService, DashboardService } from '../modules/dashboard/service/dashboard.service';

// Import Controllers
import { AuthController } from '../modules/auth/controller/auth.controller';
import { TaskController } from '../modules/task/controller/task.controller';
import { ProjectController } from '../modules/project/controller/project.controller';
import { DashboardController } from '../modules/dashboard/controller/dashboard.controller';

// Import Health Module
import { IHealthService, HealthService } from '../modules/health/service/health.service';
import { HealthController } from '../modules/health/controller/health.controller';

// Import User Module
import { IUserEntityRepository } from '../modules/user/interface/user-entity.repository.interface';
import { UserEntityRepository } from '../modules/user/repository/user-entity.repository';
import { IUserService, UserService } from '../modules/user/service/user.service';
import { UserController } from '../modules/user/controller/user.controller';

const container = new Container({ defaultScope: 'Singleton' });

// Bind Common Services
container.bind<ILoggerService>(TYPES.LoggerService).to(LoggerService).inSingletonScope();
container.bind<ICacheService>(TYPES.CacheService).to(CacheService).inSingletonScope();
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();
container.bind<ITokenService>(TYPES.TokenService).to(TokenService).inSingletonScope();
container.bind<ISocketService>(TYPES.SocketService).to(SocketService).inSingletonScope();

// Bind Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IProjectRepository>(TYPES.ProjectRepository).to(ProjectRepository);
container.bind<IProjectMemberRepository>(TYPES.ProjectMemberRepository).to(ProjectMemberRepository);
container.bind<ISessionRepository>(TYPES.SessionRepository).to(SessionRepository);
container.bind<ITaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<IUserEntityRepository>(TYPES.UserEntityRepository).to(UserEntityRepository);

// Bind Business Services
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<ITaskService>(TYPES.TaskService).to(TaskService);
container.bind<IProjectService>(TYPES.ProjectService).to(ProjectService);
container.bind<IDashboardService>(TYPES.DashboardService).to(DashboardService);
container.bind<IUserService>(TYPES.UserService).to(UserService);

// Bind Controllers
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<TaskController>(TYPES.TaskController).to(TaskController);
container.bind<ProjectController>(TYPES.ProjectController).to(ProjectController);
container.bind<DashboardController>(TYPES.DashboardController).to(DashboardController);
container.bind<UserController>(TYPES.UserController).to(UserController);

// Bind Health Module
container.bind<IHealthService>(TYPES.HealthService).to(HealthService);
container.bind<HealthController>(TYPES.HealthController).to(HealthController);

export { container };
