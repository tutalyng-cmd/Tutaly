import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('SMTP_USER')!;
    const host = this.configService.get<string>('SMTP_HOST');
    const port = parseInt(this.configService.get<string>('SMTP_PORT')!, 10);
    const pass = this.configService.get<string>('SMTP_PASS');

    console.log('[MailService] Initializing with:', {
      host,
      port,
      user: this.fromEmail,
      hasPass: !!pass,
    });

    const config = {
      host,
      port,
      secure: port === 465,
      auth: {
        user: this.fromEmail,
        pass,
      },
      // Force IPv4 because Render sometimes has outbound IPv6 issues reaching Google's SMTP servers
      family: 4,
    };

    this.transporter = nodemailer.createTransport(
      config as nodemailer.TransportOptions,
    );
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `http://localhost:3001/auth/verify-email?token=${token}`;
    console.log(`[MAILER MOCK] Verification link for ${to}: ${verifyUrl}`);

    try {
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
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send verification email to ${to}:`,
        (error as Error).message,
      );
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3001/auth/reset-password?token=${token}`;
    console.log(`[MAILER MOCK] Password reset link for ${to}: ${resetUrl}`);

    try {
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
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send password reset email to ${to}:`,
        (error as Error).message,
      );
    }
  }

  async sendMfaEmail(to: string, code: string): Promise<void> {
    console.log(`[MAILER MOCK] MFA code for ${to}: ${code}`);

    try {
      await this.transporter.sendMail({
        from: `"Tutaly Security" <${this.fromEmail}>`,
        to,
        subject: 'Your Tutaly Verification Code',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
            </div>
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
              <h2 style="color: #0D1B2A; margin-top: 0;">Verification Code</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Please use the following code to complete your sign-in. This code is valid for 5 minutes.
              </p>
              <div style="margin: 30px 0;">
                <span style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #1D9E75; background: #ffffff; padding: 10px 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  ${code}
                </span>
              </div>
              <p style="color: #718096; font-size: 14px;">
                If you didn't request this code, your account may be at risk. Please change your password immediately.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send MFA email to ${to}:`,
        (error as Error).message,
      );
    }
  }

  async sendJobApprovedEmail(
    to: string,
    jobTitle: string,
    jobId: string,
  ): Promise<void> {
    const jobUrl = `http://localhost:3000/jobs/${jobId}`;
    console.log(`[MAILER MOCK] Job approved email for ${to}, job: ${jobTitle}`);

    try {
      await this.transporter.sendMail({
        from: `"Tutaly Support" <${this.fromEmail}>`,
        to,
        subject: 'Your Tutaly Job is Live! 🎉',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
            </div>
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px;">
              <h2 style="color: #0D1B2A; margin-top: 0;">Job Approved!</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Great news! Your recent job posting for <strong>${jobTitle}</strong> has been approved by our team and is now live on the platform.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${jobUrl}" 
                   style="background: #1D9E75; color: white; padding: 14px 32px; border-radius: 8px; 
                          text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                  View Job Posting
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send job approval email to ${to}:`,
        (error as Error).message,
      );
    }
  }

  async sendBroadcastEmail(
    to: string,
    subject: string,
    htmlBody: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly" <${this.fromEmail}>`,
        to,
        subject,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
            </div>
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px;">
              ${htmlBody}
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #a0aec0; font-size: 12px;">
                You are receiving this email because you are a registered Tutaly user.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send broadcast email to ${to}:`,
        (error as Error).message,
      );
    }
  }
  async sendEmailChangeVerification(to: string, token: string): Promise<void> {
    const verificationUrl = `http://localhost:3000/verify-email-change?token=${token}`;
    console.log(
      `[MAILER MOCK] Email change verification for ${to}: ${verificationUrl}`,
    );

    try {
      await this.transporter.sendMail({
        from: `"Tutaly Security" <${this.fromEmail}>`,
        to,
        subject: 'Verify Your New Email Address',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
            </div>
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
              <h2 style="color: #0D1B2A; margin-top: 0;">Email Change Request</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to change your Tutaly account email to this address. 
                Please click the button below to verify and complete the change.
              </p>
              <a href="${verificationUrl}" 
                 style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; 
                        text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Verify New Email
              </a>
              <p style="color: #a0aec0; font-size: 14px; margin-top: 24px;">
                If you didn't request this change, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        `[MAILER ERROR] Failed to send email change verification to ${to}:`,
        (error as Error).message,
      );
    }
  }
  // --- ADS MODULE TEMPLATES ---------------------------------------

  private getAdTemplate(title: string, content: string, ctaHtml: string = '') {
    return `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0D1B2A; font-size: 28px; margin: 0;">Tutaly</h1>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #0D1B2A; margin-top: 0;">${title}</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            ${content}
          </p>
          ${ctaHtml}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #a0aec0; font-size: 12px;">
            You are receiving this because you have an active ad campaign. <br />
            You can manage your notification preferences in your dashboard.
          </p>
        </div>
      </div>
    `;
  }

  async sendAdCampaignCreatedEmail(
    to: string,
    ___campaignId: string,
  ): Promise<void> {
    const dashboardUrl = `http://localhost:3000/dashboard/employer/advertise/`;
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Created successfully',
        html: this.getAdTemplate(
          'Campaign Created',
          'Your new ad campaign has been successfully created and payment confirmed. It is currently waiting for admin review.',
          `<div style="text-align: center; margin: 30px 0;"><a href="${dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Campaign</a></div>`,
        ),
      });
    } catch (e) {
      console.error('Failed to send ad created email:', (e as Error).message);
    }
  }

  async sendAdUnderReviewEmail(
    to: string,
    ___campaignId: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Under Review',
        html: this.getAdTemplate(
          'Campaign Under Review',
          'Your ad campaign is now under review by our moderation team. You will be notified as soon as it is approved or if any changes are required.',
        ),
      });
    } catch (e) {
      console.error('Failed to send ad review email:', (e as Error).message);
    }
  }

  async sendAdApprovedEmail(to: string, ___campaignId: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Approved! 🎉',
        html: this.getAdTemplate(
          'Campaign Approved!',
          'Great news! Your ad campaign has been approved and is now live (or will start running on your scheduled start date).',
        ),
      });
    } catch (e) {
      console.error('Failed to send ad approved email:', (e as Error).message);
    }
  }

  async sendAdRejectedEmail(
    to: string,
    ___campaignId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Action Required',
        html: this.getAdTemplate(
          'Campaign Rejected',
          `Unfortunately, your ad campaign was rejected during review. Reason provided by moderator:<br/><br/><i>"${reason}"</i><br/><br/>Please update your campaign to comply with our guidelines or your budget will be refunded.`,
        ),
      });
    } catch (e) {
      console.error('Failed to send ad rejected email:', (e as Error).message);
    }
  }

  async sendAdBudget50Email(to: string, ___campaignId: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Budget Alert: 50% Used',
        html: this.getAdTemplate(
          'Budget Alert: 50%',
          'Your ad campaign has consumed 50% of its total budget. Consider adding more funds if you wish to extend its reach.',
        ),
      });
    } catch (e) {
      console.error('Failed to send ad budget 50 email:', (e as Error).message);
    }
  }

  async sendAdBudget80Email(to: string, ___campaignId: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Budget Alert: 80% Used',
        html: this.getAdTemplate(
          'Budget Alert: 80%',
          'Your ad campaign has now consumed 80% of its total budget. It will automatically pause once the budget is exhausted.',
        ),
      });
    } catch (e) {
      console.error('Failed to send ad budget 80 email:', (e as Error).message);
    }
  }

  async sendAdBudgetExhaustedEmail(
    to: string,
    ___campaignId: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Paused: Budget Exhausted',
        html: this.getAdTemplate(
          'Budget Exhausted',
          'Your ad campaign has exhausted its total budget and is now paused. Add more funds to reactivate it.',
        ),
      });
    } catch (e) {
      console.error(
        'Failed to send ad budget exhausted email:',
        (e as Error).message,
      );
    }
  }

  async sendAdCampaignEndedEmail(
    to: string,
    ___campaignId: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Campaign Ended',
        html: this.getAdTemplate(
          'Campaign Ended',
          'Your ad campaign has reached its scheduled end date and is now completed. Check your dashboard for final performance metrics.',
        ),
      });
    } catch (e) {
      console.error('Failed to send ad ended email:', (e as Error).message);
    }
  }

  async sendAdRefundProcessedEmail(
    to: string,
    ___campaignId: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Ad Budget Refund Processed',
        html: this.getAdTemplate(
          'Refund Processed',
          `We have processed a refund of ₦${amount} for your unspent ad campaign budget. This should reflect in your account shortly.`,
        ),
      });
    } catch (e) {
      console.error('Failed to send ad refund email:', (e as Error).message);
    }
  }

  async sendAdWeeklyReportEmail(to: string, reportHtml: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Tutaly Ads" <${this.fromEmail}>`,
        to,
        subject: 'Weekly Ad Performance Report',
        html: this.getAdTemplate('Weekly Performance Report', reportHtml),
      });
    } catch (e) {
      console.error(
        'Failed to send ad weekly report email:',
        (e as Error).message,
      );
    }
  }
}
