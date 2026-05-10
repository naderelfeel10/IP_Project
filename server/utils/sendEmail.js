const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '1940ba17da2571',
        pass: 'bb96c1b390516b'
    }
});

const sendVerificationEmail = async (toEmail, code) => {
    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify your account',
        html: `
            <h2>Your verification code</h2>
            <p>Use this code to activate your account:</p>
            <h1 style="color: blue; letter-spacing: 5px">${code}</h1>
            <p>This code expires in <b>10 minutes</b>.</p>
        `
    });
};

module.exports = { sendVerificationEmail };