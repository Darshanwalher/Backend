import dotenv from "dotenv";

dotenv.config();

export async function sendEmail({ to, subject, html, text }) {
    try {
        const apiKey = process.env.SENDGRID_API_KEY;
        
        if (!apiKey) {
            throw new Error("SENDGRID_API_KEY is not defined in the environment variables.");
        }

        const payload = {
            personalizations: [
                {
                    to: [
                        {
                            email: to
                        }
                    ],
                    subject: subject
                }
            ],
            from: {
                // ⚠️ This email MUST match the sender email you verified in your SendGrid account!
                email: "darshanwalher21@gmail.com",
                name: "Perplexity"
            },
            content: []
        };

        // SendGrid API requires at least one content block. We add text first, then html if available.
        if (text) {
            payload.content.push({
                type: "text/plain",
                value: text
            });
        }

        if (html) {
            payload.content.push({
                type: "text/html",
                value: html
            });
        }

        // If neither html nor text was provided, provide a fallback to avoid API errors
        if (payload.content.length === 0) {
            payload.content.push({
                type: "text/plain",
                value: " "
            });
        }

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`SendGrid API Error (${response.status}): ${errorData}`);
        }

        console.log("✅ Email dispatched successfully via SendGrid HTTP API");
        return { success: true };

    } catch (error) {
        console.error("❌ Failed to dispatch email:", error);
        throw error;
    }
}