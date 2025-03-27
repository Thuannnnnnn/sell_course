import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendSimpleEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to,
      subject,
      text,
    });
  }

  async sendHtmlEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to,
      subject,
      html,
    });
  }
}
