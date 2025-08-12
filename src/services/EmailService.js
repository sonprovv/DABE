const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

class EmailService {
    constructor() {}

    async sendEmail(data) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        const info = await transporter.sendMail({
            from: `"${data.user}" <${data.from}>`,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        })
    }
}

module.exports = new EmailService();