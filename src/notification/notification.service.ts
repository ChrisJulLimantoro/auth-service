import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { RpcException } from '@nestjs/microservices';
import * as crypto from 'crypto';

dotenv.config();

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async sendNotif(data: any): Promise<{ success: boolean }> {
    try {
      const { store_id, transaction_code } = data;
      if (!store_id || !transaction_code) {
        throw new RpcException(
          'Missing required fields: store_id or transaction_code',
        );
      }

      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
        select: {
          company: { select: { owner: { select: { email: true } } } },
        },
      });

      if (!store) {
        throw new RpcException(`Store with ID ${store_id} not found`);
      }

      const usersWithAccess = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: {
                store_id: store_id,
                pages: {
                  some: {
                    page: {
                      path: 'transaction/sales',
                      action: { in: ['open', 'all'] },
                    },
                  },
                },
              },
            },
          },
        },
        select: { email: true },
      });

      const recipientEmails = [
        store.company.owner.email,
        ...usersWithAccess.map((u) => u.email),
      ];
      console.log('Receipents ' + recipientEmails);

      if (recipientEmails.length === 0) {
        return { success: false };
      }

      await this.sendEmail(
        recipientEmails,
        transaction_code,
        'New Transaction',
      );

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async sendFailedNotif(data: any): Promise<{ success: boolean }> {
    try {
      const { store_id, transaction_code } = data;
      if (!store_id || !transaction_code) {
        throw new RpcException(
          'Missing required fields: store_id or transaction_code',
        );
      }

      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
        select: {
          company: { select: { owner: { select: { email: true } } } },
        },
      });

      if (!store) {
        throw new RpcException(`Store with ID ${store_id} not found`);
      }

      const usersWithAccess = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: {
                store_id: store_id,
                pages: {
                  some: {
                    page: {
                      path: 'transaction/failed',
                      action: { in: ['open', 'all'] },
                    },
                  },
                },
              },
            },
          },
        },
        select: { email: true },
      });

      const recipientEmails = [
        store.company.owner.email,
        ...usersWithAccess.map((u) => u.email),
      ];

      if (recipientEmails.length === 0) {
        return { success: false };
      }

      await this.sendEmail(
        recipientEmails,
        transaction_code,
        'Transaction Failed',
      );

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async sendSettlementNotif(data: any): Promise<{ success: boolean }> {
    try {
      const { store_id, transaction_code } = data;
      if (!store_id || !transaction_code) {
        throw new RpcException(
          'Missing required fields: store_id or transaction_code',
        );
      }

      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
        select: {
          company: { select: { owner: { select: { email: true } } } },
        },
      });

      if (!store) {
        throw new RpcException(`Store with ID ${store_id} not found`);
      }

      const usersWithAccess = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: {
                store_id: store_id,
                pages: {
                  some: {
                    page: {
                      path: 'transaction/settlement',
                      action: { in: ['open', 'all'] },
                    },
                  },
                },
              },
            },
          },
        },
        select: { email: true },
      });

      const recipientEmails = [
        store.company.owner.email,
        ...usersWithAccess.map((u) => u.email),
      ];

      if (recipientEmails.length === 0) {
        return { success: false };
      }

      await this.sendEmail(
        recipientEmails,
        transaction_code,
        'Transaction Settlement',
      );

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  private async sendEmail(
    recipients: string[],
    transactionCode: string,
    type: string,
    user_id?: string,
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // `true` for 465, `false` for other ports (like 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let subject = '';
    let text = '';
    let html = '';

    // Define content based on type
    if (type === 'New Transaction') {
      subject = `🔔 New Transaction: ${transactionCode}`;
      text = `Hello,\n\nA new transaction has been created with code: ${transactionCode}.\n\nPlease check the system for details.\n\nBest regards,\nYour App`;
      html = `
        <h3>🔔 New Transaction Alert</h3>
        <p>Hello,</p>
        <p>A new transaction has been created with the following details:</p>
        <ul>
          <li><strong>Transaction Code:</strong> ${transactionCode}</li>
        </ul>
        <p>Please check the system for more details.</p>
        <p>Best regards,<br>Your App</p>
      `;
    } else if (type === 'Transaction Settlement') {
      subject = `🔔 Transaction Settlement: ${transactionCode}`;
      text = `Hello,\n\nA transaction has been settled with code: ${transactionCode}.\n\nPlease review the system for more details.\n\nBest regards,\nYour App`;
      html = `
        <h3>🔔 Transaction Settlement Alert</h3>
        <p>Hello,</p>
        <p>A transaction has been settled with the following details:</p>
        <ul>
          <li><strong>Transaction Code:</strong> ${transactionCode}</li>
        </ul>
        <p>Please review the system for more details.</p>
        <p>Best regards,<br>Your App</p>
      `;
    } else if (type === 'Transaction Failed') {
      subject = `❌ Transaction Failed: ${transactionCode}`;
      text = `Hello,\n\nA transaction with code ${transactionCode} has failed.\n\nPlease check the system for more details.\n\nBest regards,\nYour App`;
      html = `
        <h3>❌ Transaction Failed Alert</h3>
        <p>Hello,</p>
        <p>A transaction has failed with the following details:</p>
        <ul>
          <li><strong>Transaction Code:</strong> ${transactionCode}</li>
        </ul>
        <p>Please check the system for more details.</p>
        <p>Best regards,<br>Your App</p>
      `;
    } else if (type === 'Email Verification') {
      // For verification emails, transactionCode is actually the verification token
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${transactionCode}&id=${user_id}`;

      subject = `✅ Email Verification Required`;
      text = `Hello,\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nYour App`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">✅ Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for creating an account! Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #c58189; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            <strong>Note:</strong> This verification link will expire in 24 hours.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with us, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Best regards,<br>Logamas
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      bcc: recipients,
      subject: subject,
      text: text,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  }

  // Add Email Verification
  async sendVerificationEmail(data: {
    email: string;
    userId: string;
  }): Promise<{ success: boolean; token?: string }> {
    try {
      const { email, userId } = data;

      if (!email || !userId) {
        throw new RpcException('Missing required fields: email or userId');
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, is_verified: true },
      });

      if (!user) {
        throw new RpcException(`User with ID ${userId} not found`);
      }

      if (user.is_verified) {
        return { success: false }; // User already verified
      }

      // Generate verification token
      const token = await this.createVerificationToken(userId);

      // Send verification email
      await this.sendEmail([email], token, 'Email Verification', userId);

      return { success: true, token };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false };
    }
  }

  async createVerificationToken(userId: string): Promise<string> {
    try {
      // Invalidate existing tokens for this user
      await this.prisma.verificationToken.updateMany({
        where: {
          user_id: userId,
          is_used: false,
          expires_at: { gt: new Date() },
        },
        data: { is_used: true },
      });

      // Generate new token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      // Save token to database
      await this.prisma.verificationToken.create({
        data: {
          token,
          user_id: userId,
          expires_at: expiresAt,
          is_used: false,
        },
      });

      return token;
    } catch (error) {
      console.error('Error creating verification token:', error);
      throw new RpcException('Failed to create verification token');
    }
  }

  async verifyEmailToken(
    token: string,
  ): Promise<{ success: boolean; userId?: string }> {
    try {
      // Find valid token
      const verificationToken = await this.prisma.verificationToken.findFirst({
        where: {
          token,
          is_used: false,
          expires_at: { gt: new Date() }, // Not expired
        },
        include: {
          user: true,
        },
      });

      if (!verificationToken) {
        return { success: false };
      }

      // Mark user as verified
      await this.prisma.user.update({
        where: { id: verificationToken.user_id },
        data: { is_verified: true },
      });

      // Mark token as used
      await this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { is_used: true },
      });

      return { success: true, userId: verificationToken.user_id };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { success: false };
    }
  }

  async resendVerificationEmail(userId: string): Promise<{ success: boolean }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, is_verified: true },
      });

      if (!user) {
        throw new RpcException(`User with ID ${userId} not found`);
      }

      if (user.is_verified) {
        return { success: false }; // Already verified
      }

      return await this.sendVerificationEmail({
        email: user.email,
        userId: user.id,
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { success: false };
    }
  }
}
