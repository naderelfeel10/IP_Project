const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
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