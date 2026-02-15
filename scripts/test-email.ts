import { remindContestEmail } from "../src/lib/email/templates/contestReminder";
import fs from 'fs';
import path from 'path';

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.replace(/^"|"$/g, '');
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Failed to load .env file manually", e);
}

async function main() {
    // Dynamic import to ensure process.env is populated before mailer is initialized
    const { sendEmail } = await import("../src/lib/email/sendEmail");

    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address as an argument.");
        process.exit(1);
    }

    console.log(`Sending test email to ${email}...`);

    const { subject, html, text } = remindContestEmail({
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        openSmaranaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contests`,
        settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
        userName: "Test User",
        contestName: "Weekly Contest 400",
        platform: "LeetCode",
        startsAtLabel: "Sunday, 10:30 AM (IST)",
        startsInLabel: "2 days",
        contestUrl: "https://leetcode.com/contest/weekly-contest-400/",
    });

    try {
        await sendEmail({
            to: email,
            subject,
            html,
            text,
        });
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Failed to send email:", error);
        process.exit(1);
    }
}

main();
