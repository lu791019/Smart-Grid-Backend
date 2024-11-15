// config.ts
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const mailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
};

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.auth.user,
    pass: mailConfig.auth.pass,
  },
});

export async function sendEmail({ to, subject, text, html }: MailOptions) {
  const mailOptions = {
    from: mailConfig.auth.user,
    to,
    subject,
    text,
    html,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('郵件發送成功: %s', info.messageId);
  } catch (error) {
    console.error('郵件發送失敗: %s', error);
  }
}
