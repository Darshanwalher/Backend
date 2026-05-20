import dotenv from "dotenv";

dotenv.config();

export async function sendEmail({ to, subject, html, text }) {
    try {
        const {
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REFRESH_TOKEN,
            GOOGLE_USER
        } = process.env;

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GOOGLE_USER) {
            throw new Error("Missing Google OAuth credentials in environment variables.");
        }

        // 1. Get a fresh Access Token using the Refresh Token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: GOOGLE_REFRESH_TOKEN,
                grant_type: "refresh_token"
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            throw new Error(`Failed to get Google Access Token: ${errText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Construct the raw RFC 2822 email message
        const emailLines = [
            `From: "Perplexity" <${GOOGLE_USER}>`,
            `To: ${to}`,
            // Safe UTF-8 encoding for subject
            `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html || text || " "
        ];
        
        const rawMessage = emailLines.join('\r\n');
        
        // Base64URL encode the message (required by Gmail API)
        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // 3. Send the email using the Gmail REST API (over HTTPS, bypasses SMTP block)
        const sendResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                raw: encodedMessage
            })
        });

        if (!sendResponse.ok) {
            const errorData = await sendResponse.text();
            throw new Error(`Gmail API Error (${sendResponse.status}): ${errorData}`);
        }

        console.log("✅ Email dispatched successfully via native Gmail HTTP API");
        return { success: true };

    } catch (error) {
        console.error("❌ Failed to dispatch email:", error);
        throw error;
    }
}