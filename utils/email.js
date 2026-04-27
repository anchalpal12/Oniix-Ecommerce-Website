const nodemailer = require('nodemailer');

const sendInvoiceEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS  // app-specific password
    }
  });

  const mailOptions = {
    from: `"Your Company" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendInvoiceEmail;
