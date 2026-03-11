const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using SMTP transport
// We are pulling the credentials from the .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});

/**
 * Sends an email.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} html - The HTML body of the email.
 * @returns {Promise<object>} - The result from nodemailer's sendMail function.
 */
const sendMail = async (to, subject, html) => {
  // Check if email sending is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration is incomplete. Skipping email send.");
    // Return a mock success to prevent frontend errors if email is not critical
    return Promise.resolve({ success: false, message: "Email not configured on server." });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html, // html body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow to be caught by the calling route
  }
};

module.exports = { sendMail };
