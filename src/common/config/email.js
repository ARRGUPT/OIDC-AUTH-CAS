import nodemailer from "nodemailer"

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `${process.env.SMTP_FROM_EMAIL}`,
        to,
        subject,
        html
    })
}

const sendVerificationEmail = async (email, token) => {             // email === to
    const subject = "Verify your email";

    const html = `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your account:</p>
        <a href="http://localhost:3000/verify/${token}">
            Verify Email
        </a>
    `;
    
    await transporter.sendMail({
        from: `${process.env.SMTP_FROM_EMAIL}`,
        to: email,
        subject,
        html,
    })
}

export {sendEmail, sendVerificationEmail}
