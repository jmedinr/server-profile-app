import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

// Verificar si las variables de entorno están definidas
const validateEnvVariables = () => {
  if (!process.env.REACT_APP_EMAIL_USER || !process.env.REACT_APP_EMAIL_PASS) {
    console.error('Email credentials are not set in the environment variables.');
    process.exit(1); // Termina la aplicación si faltan las credenciales
  }
};

// Configura el transporte para enviar correos electrónicos
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.REACT_APP_EMAIL_USER,
      pass: process.env.REACT_APP_EMAIL_PASS,
    },
  });
};

// Configurar servidor Express
const configureServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  return app;
};

// Manejar envío de correos electrónicos
const handleEmailSending = async (req, res, contactEmail) => {
  const { firstName, lastName, email, message, phone } = req.body;
  const name = `${firstName} ${lastName}`;

  const mailOptions = {
    from: name,
    to: process.env.REACT_APP_EMAIL_USER, // El destinatario es el mismo usuario definido en las variables de entorno
    subject: "Contact Form Submission - Portfolio",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await contactEmail.sendMail(mailOptions);
    console.log("Message sent successfully");
    res.status(200).json({ status: "Message sent" });
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    res.status(500).json({ error: "Error sending message" });
  }
};

// Definir rutas
const configureRoutes = (app, contactEmail) => {
  app.post("/contact", (req, res) => handleEmailSending(req, res, contactEmail));
};

// Inicializar el servidor
const startServer = (app) => {
  const PORT = process.env.REACT_APP_SERVER_PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Flujo principal
const main = () => {
  validateEnvVariables();

  const app = configureServer();
  app.use(cors());
  app.use(cors({
    origin: '*',  // React app running on this origin
    methods: ['GET', 'POST'],
    credentials: true
  }));
  

  const contactEmail = createEmailTransporter();

  contactEmail.verify((error) => {
    if (error) {
      console.error(`Email transport error: ${error.message}`);
      return;
    }
    console.log("Ready to send emails");
    
  });

  configureRoutes(app, contactEmail);
  startServer(app);
};

main();
