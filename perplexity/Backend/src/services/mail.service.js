import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create the transporter using SendGrid's specialized SMTP relay
const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 2525, // Port 2525 is open on Render's free tier
    auth: {
        user: "apikey", // ⚠️ This MUST literally be the exact string "apikey"
        pass: process.env.SENDGRID_API_KEY // Your SG.xx API key from your environment
    },
    // Adding secure options to prevent handshake dropping
    tls: {
        rejectUnauthorized: false 
    }
});

// Verify the connection configuration on startup
transporter.verify()
    .then(() => {
        console.log("✅ Nodemailer is successfully connected via SendGrid!");
    })
    .catch((err) => {
        console.error("❌ SendGrid Nodemailer connection failed:", err.message);
    });

export async function sendEmail({ to, subject, html, text }) {
    try {
        const mailOptions = {
            // ⚠️ This email MUST match the sender email you verified in your SendGrid account!
            from: `"Perplexity" <darshanwalher21@gmail.com>`, 
            to,
            subject,
            html,
            text
        };

        const details = await transporter.sendMail(mailOptions);

        console.log("✅ Email dispatched successfully via SendGrid");
        return details;

    } catch (error) {
        console.error("❌ Failed to dispatch email:", error);
        throw error;
    }
}