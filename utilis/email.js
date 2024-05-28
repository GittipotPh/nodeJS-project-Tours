const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
    }

    newTransport () {
        if (process.env.NODE_ENV === 'production') {
            // Mailjet SMTP configuration
            return nodemailer.createTransport({
                host: 'smtp.elasticemail.com', // Elastic Email SMTP server host
                port: 2525, // Elastic Email SMTP port
                secure: false, // Whether to use TLS (true for 465, false for other ports)
                auth: {
                    user: 'gonggang_2539@outlook.com', // Your Elastic Email SMTP username
                    pass: '4B1542566C7AC803A66DE381790C9FD02AAE' // Your Elastic Email SMTP password
                }

        

});
        } else {
            // Default SMTP configuration for development
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    //send actual email
    async send(template, subject) {
        // 1) Render HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        };

        // 3) Create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
};
