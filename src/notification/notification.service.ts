import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async sendNotif(data: any): Promise<{ success: boolean }> {
    try {
      const { store_id, transaction_code } = data;
      if (!store_id || !transaction_code) {
        throw new Error(
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
        throw new Error(`Store with ID ${store_id} not found`);
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

      if (recipientEmails.length === 0) {
        return { success: false };
      }

      await this.sendEmail(recipientEmails, transaction_code);

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  private async sendEmail(recipients: string[], transactionCode: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // `true` for 465, `false` for other ports (like 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      bcc: recipients,
      subject: `🔔 New Transaction: ${transactionCode}`,
      text: `Hello,\n\nA new transaction has been created with code: ${transactionCode}.\n\nPlease check the system for details.\n\nBest regards,\nYour App`,
      html: `
        <h3>🔔 New Transaction Alert</h3>
        <p>Hello,</p>
        <p>A new transaction has been created with the following details:</p>
        <ul>
          <li><strong>Transaction Code:</strong> ${transactionCode}</li>
        </ul>
        <p>Please check the system for more details.</p>
        <p>Best regards,<br>Your App</p>
      `,
    };
    await transporter.sendMail(mailOptions);
  }
}
