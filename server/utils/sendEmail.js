const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
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
        from: `"Your App" <${process.env.EMAIL_USER}>`,
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

<<<<<<< HEAD
module.exports = { sendVerificationEmail };

=======
module.exports = { sendVerificationEmail };
>>>>>>> de56e9c45c678c00cec6a71d9492ce9c7b0d1b1d
