const nodemailer = require('nodemailer');

// Read SMTP configuration from environment variables
const DEFAULT_SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const DEFAULT_SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const DEFAULT_SMTP_SECURE = process.env.SMTP_SECURE !== 'false';
const DEFAULT_SMTP_USER = process.env.SMTP_USER || 'elamparuthikp@gmail.com';
const DEFAULT_MAIL_FROM = process.env.MAIL_FROM || 'NSS College Management Portal <elamparuthikp@gmail.com>';

function getTransporter() {
  const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const user = process.env.SMTP_USER || DEFAULT_SMTP_USER;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || String(DEFAULT_SMTP_PORT), 10),
    secure: process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE !== 'false' : DEFAULT_SMTP_SECURE,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Sends a 6-digit OTP verification email for password reset.
 * Never logs the OTP code.
 */
async function sendOtpEmail(toEmail, recipientName, otpCode) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`⚠️ SMTP_PASSWORD not set. Email dispatch to ${toEmail} skipped.`);
    return false;
  }

  const mailFrom = process.env.MAIL_FROM || DEFAULT_MAIL_FROM;

  const mailOptions = {
    from: mailFrom,
    to: toEmail,
    subject: '🔐 NSS Portal Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1d4ed8; margin: 0;">NSS College Management Portal</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">National Service Scheme - Password Reset</p>
        </div>
        
        <p style="font-size: 15px; color: #1e293b;">Hello <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          A password reset was requested for your account. Use the 6-digit OTP code below to verify your account:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bfdbfe; display: inline-block;">
            ${otpCode}
          </span>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.4;">
          This verification code is valid for <strong>10 minutes</strong>. For security, do not share this code with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          If you did not request a password reset, please ignore this email or contact the NSS Office.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Password reset OTP email dispatched successfully to ${toEmail} [MessageId: ${info.messageId}]`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${toEmail}:`, err.message);
    return false;
  }
}

module.exports = {
  sendOtpEmail
};
