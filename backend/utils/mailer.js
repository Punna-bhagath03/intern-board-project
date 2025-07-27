const nodemailer = require('nodemailer');

const { GMAIL_USER, GMAIL_PASS } = process.env;

// Only create transporter if Gmail credentials are provided
let transporter = null;
if (GMAIL_USER && GMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });
}

/**
 * Send an email using Gmail SMTP
 * @param {Object} param0
 * @param {string} param0.to - Recipient email address
 * @param {string} param0.subject - Email subject
 * @param {string} param0.html - Email HTML content
 * @returns {Promise}
 */
async function sendMail({ to, subject, html }) {
  if (!to || !subject || !html) {
    throw new Error('to, subject, and html are required');
  }
  
  // If no transporter is configured, just log the email (for development)
  if (!transporter) {
    console.log('📧 Email would be sent (Gmail not configured):', { to, subject });
    return Promise.resolve();
  }
  
  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail }; 