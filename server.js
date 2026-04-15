/* ================================================================
   PORTFOLIO BACKEND SERVER  (Phase 2 Enhanced)
   ================================================================ */
require('dotenv').config();

const express   = require('express');
const nodemailer = require('nodemailer');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const morgan    = require('morgan');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Request logging in dev mode
app.use(express.static(__dirname)); // Serve static files

// ── Rate Limiting ─────────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15 minutes
  max      : 5,               // max 5 requests per window per IP
  standardHeaders: true,
  legacyHeaders  : false,
  message: { error: 'Too many messages sent. Please wait 15 minutes before trying again.' },
});

// ── Input Sanitizer (lightweight, no extra deps) ──────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .trim()
    .substring(0, 1000); // hard cap
}

// ── Nodemailer Transporter ────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('[Nodemailer] Configuration error:', error.message);
  } else {
    console.log('[Nodemailer] ✓ Ready to send messages');
  }
});

// ── Branded HTML Email Template ───────────────────────────────
function buildEmailHTML({ name, email, subject, message }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio Contact</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#161616;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.06);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:36px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">RVR<span style="color:#93c5fd;">.</span></p>
                      <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.15em;text-transform:uppercase;">Portfolio Contact Form</p>
                    </td>
                    <td align="right">
                      <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50px;padding:6px 14px;font-size:11px;font-weight:700;color:#fff;letter-spacing:0.1em;text-transform:uppercase;">New Message</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">

                <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.6;">
                  You've received a new message through your portfolio contact form. Details are below.
                </p>

                <!-- Sender Info -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#60a5fa;">From</p>
                      <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">${name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#60a5fa;">Email</p>
                      <a href="mailto:${email}" style="color:#93c5fd;font-size:15px;text-decoration:none;font-weight:500;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#60a5fa;">Subject</p>
                      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.75);font-weight:500;">${subject || '(No subject)'}</p>
                    </td>
                  </tr>
                </table>

                <!-- Message -->
                <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#60a5fa;">Message</p>
                <div style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.2);border-radius:12px;padding:22px 24px;border-left:3px solid #2563eb;">
                  <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.8);white-space:pre-wrap;">${message}</p>
                </div>

                <!-- CTA -->
                <p style="margin:32px 0 0;text-align:center;">
                  <a href="mailto:${email}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 32px;border-radius:50px;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">Reply to ${name}</a>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:rgba(0,0,0,0.3);border-top:1px solid rgba(255,255,255,0.05);padding:20px 40px;">
                <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);text-align:center;">
                  Vijayaragavan R &nbsp;·&nbsp; Portfolio &nbsp;·&nbsp; This email was sent automatically via the contact form.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// ── Health Check Endpoint ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status   : 'ok',
    timestamp: new Date().toISOString(),
    service  : 'Vijayaragavan R — Portfolio API',
  });
});

// ── Contact Form Endpoint ─────────────────────────────────────
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate presence
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Validate email format
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Sanitize all inputs
  const safeName    = sanitize(name);
  const safeEmail   = sanitize(email);
  const safeSubject = sanitize(subject || '');
  const safeMessage = sanitize(message);

  const mailOptions = {
    from   : process.env.EMAIL_USER,
    to     : process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
    replyTo: safeEmail,
    subject: `[Portfolio] ${safeSubject || 'New Message'} — from ${safeName}`,
    text   : `Name: ${safeName}\nEmail: ${safeEmail}\nSubject: ${safeSubject || 'N/A'}\n\nMessage:\n${safeMessage}`,
    html   : buildEmailHTML({ name: safeName, email: safeEmail, subject: safeSubject, message: safeMessage }),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Contact] ✓ Email sent from ${safeName} <${safeEmail}>`);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('[Contact] ✗ Failed to send email:', error.message);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] ✓ Running at http://localhost:${PORT}`);
  console.log(`[Server]   Health check → http://localhost:${PORT}/api/health`);
});
