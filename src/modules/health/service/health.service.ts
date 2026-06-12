import { injectable, inject } from 'inversify';
import mongoose from 'mongoose';
import { TYPES } from '../../../dependency_injection/types';
import { ILoggerService } from '../../../services/common/logger.service';

export interface IHealthService {
    getHealthStatus(): Promise<HealthStatus>;
}

export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    mongodb: {
        connected: boolean;
        state: string;
    };
}

@injectable()
export class HealthService implements IHealthService {
    constructor(
        @inject(TYPES.LoggerService) private logger: ILoggerService
    ) { }

    async getHealthStatus(): Promise<HealthStatus> {
        const mongodbConnected = mongoose.connection.readyState === 1;
        const mongodbState = this.getMongoConnectionState(mongoose.connection.readyState);

        this.logger.info(`Health check: MongoDB ${mongodbState}, App uptime ${process.uptime()}s`);

        return {
            status: mongodbConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            mongodb: {
                connected: mongodbConnected,
                state: mongodbState,
            },
        };
    }

    private getMongoConnectionState(state: number): string {
        const states: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        return states[state] || 'unknown';
    }
}
