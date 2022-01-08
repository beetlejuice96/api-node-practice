import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { environment } from "../config/environment";
export class EmailController {
  transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: environment.HOST,
      port: 2525,
      auth: {
        user: environment.USER,
        pass: environment.PASS,
      },
    });
  }
  async sendEmail(email: string) {
    const message: Mail.Options = {
      from: "from-example@email.com",
      to: email,
      subject: "Subject",
      text: "Hello SMTP Email",
    };
    this.transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  }
}
