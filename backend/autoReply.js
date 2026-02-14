import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: send emails
async function sendEmail({ from, to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password
    },
  });

  return transporter.sendMail({ from, to, subject, text, html });
}

// Contact endpoint
app.post("/contact", async (req, res) => {
  try {
    const { name = "Visitor", email, message = "No message provided" } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // 1️⃣ Send email to yourself
    await sendEmail({
      from: `"Portfolio Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // 2️⃣ Auto-reply to visitor
    const htmlTemplate = `
      <div style="font-family:Arial,sans-serif;background:#0f172a;padding:30px;color:#e2e8f0;">
        <div style="max-width:600px;margin:auto;background:#1e293b;padding:30px;border-radius:10px;">
          <h2 style="color:#38bdf8;">Hello ${name} 👋</h2>
          <p>Thank you for contacting me through my portfolio.</p>
          <blockquote style="background:#0f172a;padding:15px;border-left:4px solid #38bdf8;">
            ${message}
          </blockquote>
          <p>I will get back to you within <b>24 hours</b>.</p>
          <p>
            🔗 <a href="https://www.linkedin.com/in/s-ashwin-kumar-5053bb272/" style="color:#38bdf8;">LinkedIn</a><br/>
            🐦 <a href="https://x.com/ash_marvel_15" style="color:#38bdf8;">Twitter</a><br/>
            📸 <a href="https://www.instagram.com/ash_brave_2004/" style="color:#38bdf8;">Instagram</a>
          </p>
          <hr style="margin:25px 0;border:1px solid #334155;"/>
          <p>Best Regards,<br/><b>S Ashwin Kumar</b></p>
        </div>
      </div>
    `;

    await sendEmail({
      from: `"S Ashwin Kumar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting me!",
      html: htmlTemplate,
    });

    // Respond with redirect URL
    res.status(200).json({ redirect: "/success.html" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
