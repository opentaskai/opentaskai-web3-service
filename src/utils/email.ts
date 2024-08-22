import nodemailer from 'nodemailer';
import { EMAIL_ENV } from '../constants';
let emailIndex = 0;
class Mailer {
    smtpOption: any;
    transporter: any;
    constructor(host: string, port: string | number, user: string, pass: string) {
        if (!host || !port || !user || !pass) {
            console.error('Mailer, invlaid parameters');
            throw new Error('Mailer, invlaid parameters');
        }

        this.smtpOption = {
            host,
            port,
            secure: true,
            auth: {
                user,
                pass
            }
        };
    }

    async sendMail(from: string, to: string, subject: string, content: string = '', remark: string = '', html: boolean = true) {
        const email_accounts = EMAIL_ENV.EMAIL_USERNAME.split(',');
        const email_passwords = EMAIL_ENV.EMAIL_PASSWORD.split(',');
        emailIndex = emailIndex >= email_accounts.length ? 0 : emailIndex;

        const mailOptions: any = {
            from,
            to,
            subject
        };
        if (html) {
            mailOptions.html = content;
        } else {
            mailOptions.text = content;
        }
        let _smtpOption: Record<string, any> = {};
        // console.log('emailIndex:::', emailIndex);

        _smtpOption = {
            ...this.smtpOption,
            auth: {
                user: email_accounts[emailIndex],
                pass: email_passwords[emailIndex]
            }
        };
        mailOptions.from = `OpenTaskAI ${EMAIL_ENV.EMAIL_USERNAME}`;
        emailIndex++;
        // console.log('from::', _smtpOption.auth.user, 'to:', to, 'content:', content, 'remark::', remark);
        const transporter = nodemailer.createTransport(_smtpOption);
        return await transporter.sendMail(mailOptions);
    }
}

const mail = new Mailer(EMAIL_ENV.EMAIL_SERVER, EMAIL_ENV.EMAIL_PORT, EMAIL_ENV.EMAIL_USERNAME, EMAIL_ENV.EMAIL_PASSWORD);

export default mail;
