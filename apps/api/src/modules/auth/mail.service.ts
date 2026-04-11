import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('SMTP_USER')!;
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT')!, 10),
      secure: true, // true for port 465
      auth: {
        user: this.fromEmail,
        pass: this.configService.get<string>('SMTP_PASS')!,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `http://localhost:3001/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: `"Tutaly" <${this.fromEmail}>`,
      to,
      subject: 'Verify your Tutaly account',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
          </div>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 32px;">
            <h2 style="color: #0D1B2A; margin-top: 0;">Welcome aboard! 🎉</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Thanks for signing up. Please verify your email address to get started.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background: #1D9E75; color: white; padding: 14px 32px; border-radius: 8px; 
                        text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Verify My Email
              </a>
            </div>
            <p style="color: #718096; font-size: 14px;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3001/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: `"Tutaly" <${this.fromEmail}>`,
      to,
      subject: 'Reset your Tutaly password',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
          </div>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 32px;">
            <h2 style="color: #0D1B2A; margin-top: 0;">Password Reset</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #1D9E75; color: white; padding: 14px 32px; border-radius: 8px; 
                        text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #718096; font-size: 14px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }
}
