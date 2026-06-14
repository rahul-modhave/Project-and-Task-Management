import { injectable, inject } from 'inversify';
import { TYPES } from '../../../dependency_injection/types';
import { IProjectService } from '../../project/service/project.service';
import { ITaskRepository } from '../../task/interface/task.repository.interface';
import { IUserRepository } from '../../auth/interface/user.repository.interface';
import { ProjectDocument } from '../../project/entity/project.entity';
import { TaskDocument } from '../../task/entity/task.entity';
import { Types } from 'mongoose';

export interface DashboardProjectSummary {
    projectId: string;
    name: string;
    progress: number;
    status: string;
    totalTasks: number;
    completedTasks: number;
    dueDate?: string | null;
}

export interface DashboardTaskDeadline {
    taskId: string;
    name: string;
    assignee?: string | null;
    priority: string;
    dueDate?: string | null;
    status: string;
}

export interface DashboardActivity {
    activityId: string;
    actor: string;
    action: string;
    target: string;
    context: string;
    timestamp: string;
}

export interface DashboardResponse {
    summary: {
        totalProjects: number;
        totalTasks: number;
        activeUsers: number;
        completedTasks: number;
    };
    projectProgress: {
        overallProgress: number;
        projects: DashboardProjectSummary[];
    };
    teamProductivity: {
        label: string;
        series: Array<{ date: string; value: number }>;
    };
    recentActivities: DashboardActivity[];
    upcomingDeadlines: DashboardTaskDeadline[];
}

@injectable()
export class DashboardService {
    constructor(
        @inject(TYPES.ProjectService) private projectService: IProjectService,
        @inject(TYPES.TaskRepository) private taskRepository: ITaskRepository,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository
    ) { }

    public async getDashboard(userId: string): Promise<DashboardResponse> {
        const projects = await this.projectService.getProjectsByManager(userId);
        const projectIds = projects.map((project) => project._id.toString());
        const tasks = projectIds.length > 0 ? await this.taskRepository.findByProjectIds(projectIds) : [];

        const userMap = await this.buildUsersMap(projects, tasks);

        return {
            summary: this.buildSummary(projects, tasks, userMap),
            projectProgress: this.buildProjectProgress(projects, tasks),
            teamProductivity: this.buildTeamProductivity(tasks),
            recentActivities: this.buildRecentActivities(tasks, userMap),
            upcomingDeadlines: this.buildUpcomingDeadlines(tasks, userMap),
        };
    }

    private async buildUsersMap(projects: ProjectDocument[], tasks: TaskDocument[]) {
        const ids = new Set<string>();

        projects.forEach((project) => {
            ids.add(project.projectManager.toString());
            project.members.forEach((memberId) => ids.add(memberId.toString()));
        });

        tasks.forEach((task) => {
            if (task.assigneeId) ids.add(task.assigneeId);
            if (task.reporterId) ids.add(task.reporterId);
        });

        if (ids.size === 0) {
            return {} as Record<string, string>;
        }

        const allIds = Array.from(ids);
        // Only query DB for valid ObjectId values to avoid CastError
        const validIds = allIds.filter((id) => Types.ObjectId.isValid(id));
        const users = validIds.length > 0 ? await this.userRepository.findByIds(validIds) : [];

        const map = users.reduce((map: Record<string, string>, user) => {
            if (user && user._id) {
                map[user._id.toString()] = `${user.firstName} ${user.lastName}`;
            }
            return map;
        }, {} as Record<string, string>);

        // Ensure non-ObjectId ids are present but unresolved (null) so callers can fallback
        allIds.forEach((id) => {
            if (!map[id]) {
                map[id] = null as any;
            }
        });

        return map;
    }

    private buildSummary(projects: ProjectDocument[], tasks: TaskDocument[], userMap: Record<string, string>) {
        const totalProjects = projects.length;
        const totalTasks = tasks.length;
        const activeUsers = this.countActiveUsers(projects, userMap);
        const completedTasks = tasks.filter((task) => task.statusId?.toLowerCase() === 'completed').length;

        return {
            totalProjects,
            totalTasks,
            activeUsers,
            completedTasks,
        };
    }

    private countActiveUsers(projects: ProjectDocument[], userMap: Record<string, string>) {
        const userIds = new Set<string>();

        projects.forEach((project) => {
            userIds.add(project.projectManager.toString());
            project.members.forEach((memberId) => userIds.add(memberId.toString()));
        });

        return Array.from(userIds).filter((id) => Boolean(userMap[id])).length;
    }

    private buildProjectProgress(projects: ProjectDocument[], tasks: TaskDocument[]) {
        const projectsSummary = projects.map((project) => {
            const projectTaskList = tasks.filter((task) => task.projectId === project._id.toString());
            const completedTasks = projectTaskList.filter((task) => task.statusId?.toLowerCase() === 'completed').length;

            return {
                projectId: project._id.toString(),
                name: project.name,
                progress: project.progress ?? 0,
                status: project.status,
                totalTasks: projectTaskList.length,
                completedTasks,
                dueDate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
            };
        });

        const overallProgress = projectsSummary.length > 0
            ? Math.round(projectsSummary.reduce((sum, p) => sum + p.progress, 0) / projectsSummary.length)
            : 0;

        return {
            overallProgress,
            projects: projectsSummary,
        };
    }

    private buildTeamProductivity(tasks: TaskDocument[]) {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));
            return { date: date.toISOString().split('T')[0], value: 0 };
        });

        tasks.forEach((task) => {
            if (!task.updatedAt) return;
            const updatedDate = new Date(task.updatedAt).toISOString().split('T')[0];
            const point = last7Days.find((item) => item.date === updatedDate);
            if (point) {
                point.value += 1;
            }
        });

        return {
            label: 'Last 7 Days',
            series: last7Days,
        };
    }

    private buildRecentActivities(tasks: TaskDocument[], userMap: Record<string, string>) {
        const sortedTasks = [...tasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return sortedTasks.slice(0, 5).map((task) => ({
            activityId: task._id.toString(),
            actor: task.reporterId ? userMap[task.reporterId] || 'Unknown' : 'Unknown',
            action: task.statusId?.toLowerCase() === 'completed' ? 'completed' : 'updated',
            target: task.title,
            context: task.projectId,
            timestamp: task.updatedAt.toISOString(),
        }));
    }

    private buildUpcomingDeadlines(tasks: TaskDocument[], userMap: Record<string, string>) {
        const upcoming = tasks
            .filter((task) => task.dueDate && new Date(task.dueDate) >= new Date())
            .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))
            .slice(0, 6);

        return upcoming.map((task) => ({
            taskId: task._id.toString(),
            name: task.title,
            assignee: task.assigneeId ? userMap[task.assigneeId] || null : null,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
            status: task.statusId,
        }));
    }
}
