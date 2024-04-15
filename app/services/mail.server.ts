import { createTransport } from 'nodemailer';

export const mailer = createTransport(process.env.MAIL_URL, {
  from: `${process.env.MAIL_FROM_TITLE} <${process.env.MAIL_FROM}>`,
});
