import { injectable, inject } from 'inversify';
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { TYPES } from '../../dependency_injection/types';
import { ILoggerService } from './logger.service';

export interface IEmailService {
  sendMail(to: string, subject: string, html: string): Promise<void>;
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

@injectable()
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {
    // Check if configuration exists
    const hasCredentials = config.mail.user && config.mail.pass;
    if (hasCredentials) {
      this.transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      });
    } else {
      this.logger.warn('SMTP credentials not configured. EmailService will output to Console only.');
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: config.mail.from,
          to,
          subject,
          html,
        });
        this.logger.info(`Email sent successfully to ${to}`);
      } else {
        this.logger.info(`[MOCK EMAIL DISPATCH] To: ${to} | Subject: ${subject}\nContent:\n${html}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = `http://localhost:${config.app.port}/api/v1/auth/verify-email?token=${token}`;
    const html = `
      <h1>Verify your Email</h1>
      <p>Thank you for signing up to CollabFlow. Please click the link below to verify your email address:</p>
      <a href="${link}" target="_blank">Verify Email</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;
    await this.sendMail(email, 'CollabFlow - Verify Email Address', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `http://localhost:${config.app.port}/api/v1/auth/reset-password?token=${token}`;
    const html = `
      <h1>Reset your Password</h1>
      <p>We received a request to reset your CollabFlow password. Please click the link below to set a new password:</p>
      <a href="${link}" target="_blank">Reset Password</a>
      <p>This reset link will expire in 1 hour.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;
    await this.sendMail(email, 'CollabFlow - Password Reset Request', html);
  }
}
