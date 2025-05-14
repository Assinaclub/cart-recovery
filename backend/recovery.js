const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function enviarEmail(email, conteudo) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Seu carrinho está esperando por você!",
    html: `
      <h2>Você deixou alguns produtos para trás 😢</h2>
      <p>${conteudo}</p>
      <a href="https://seudominio.com/checkout">Clique aqui para finalizar sua compra</a>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarEmail };
