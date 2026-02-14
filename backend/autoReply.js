import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/contact", async (req, res) => {
  try {
    const { name = "Visitor", email, message = "No message" } = req.body;

    if (!email) return res.status(400).send("Email missing");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send email to you
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    // Auto-reply to visitor
    await transporter.sendMail({
      from: `"S Ashwin Kumar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting me!",
      html: `
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
      `,
    });

    res.status(200).json({ redirect: "/success.html" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send email");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
