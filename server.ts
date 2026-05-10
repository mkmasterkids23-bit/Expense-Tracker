import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to send OTP emails
  app.post("/api/send-otp", async (req, res) => {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Missing email or OTP" });
    }

    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        console.warn("[AUTH] Email credentials missing. Code logged to console.");
        return res.status(200).json({ 
          success: false, 
          error: "Email delivery channel offline (missing secrets).",
          code: otp // Return code for testing if email is off
        });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Authentication System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "[SECURITY] Your Verification Code",
        html: `
          <div style="font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px;">
            <h1 style="color: #2563eb; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Identity Verification</h1>
            <p style="font-size: 14px; color: #64748b;">A security request has been initiated for <strong>${name || email}</strong>.</p>
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; background: #ffffff; padding: 24px; border: 2px solid #3b82f6; border-radius: 16px; margin: 32px 0; text-align: center; color: #1e293b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              ${otp}
            </div>
            <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 1px;">Expires in 10 minutes</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="font-size: 10px; color: #94a3b8; font-style: italic;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[AUTH SUCCESS] OTP sent to ${email}`);
      res.json({ success: true, message: "OTP sent successfully." });
    } catch (error: any) {
      console.error("[AUTH EMAIL ERROR]:", error.message);
      res.status(200).json({ 
        success: false, 
        error: "Email delivery failed.",
        details: error.message 
      });
    }
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
