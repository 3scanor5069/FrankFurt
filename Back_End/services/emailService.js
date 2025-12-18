// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // tu email
    pass: process.env.EMAIL_PASSWORD    // tu contraseña o app password
  }
});

/**
 * Envía un correo electrónico
 * @param {string} to - destinatario
 * @param {string} subject - asunto
 * @param {string} text - contenido plano
 * @param {string} html - contenido HTML opcional
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};
