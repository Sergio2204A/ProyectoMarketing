const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(to, resetUrl) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Falta configurar EMAIL_USER y EMAIL_APP_PASSWORD en el archivo .env del backend.");
  }

  await transporter.sendMail({
    from: `"Marketing AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Recupera tu contraseña — Marketing AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Recupera tu contraseña</h2>
        <p style="color: #555; line-height: 1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Marketing AI.
          Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en 1 hora.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #c9692b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Restablecer contraseña
        </a>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          Si no solicitaste este cambio, puedes ignorar este correo — tu contraseña seguirá siendo la misma.
        </p>
      </div>
    `,
  });
}

async function sendCalendarReminderEmail(to, dayItem) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Falta configurar EMAIL_USER y EMAIL_APP_PASSWORD en el archivo .env del backend.");
  }

  await transporter.sendMail({
    from: `"Marketing AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Hoy toca publicar: ${dayItem.topic} — Marketing AI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Hoy toca publicar 📅</h2>
        <p style="color: #555; line-height: 1.6;">
          Según tu calendario de contenidos, hoy (<strong>${dayItem.day}</strong>) te toca publicar:
        </p>
        <p style="color: #1a1a1a; font-weight: bold; margin: 16px 0 4px;">${dayItem.topic}</p>
        <p style="color: #555; line-height: 1.6; white-space: pre-line;">${dayItem.caption}</p>
        <p style="color: #555; line-height: 1.6;"><strong>Idea visual:</strong> ${dayItem.visualIdea}</p>
        <p style="color: #999; font-size: 13px;"><strong>Hora recomendada:</strong> ${dayItem.bestTime}</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendCalendarReminderEmail };
