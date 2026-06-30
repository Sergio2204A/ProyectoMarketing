const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/emailService");

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc  Registrar nuevo usuario
// @route POST /auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "El email ya está registrado" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Iniciar sesión
// @route POST /auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario (incluir password que por defecto está excluida)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Obtener usuario actual
// @route GET /auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
};

// @desc  Actualizar perfil
// @route PUT /auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.password) {
      if (req.body.password.length < 6)
        return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres" });
      user.password = req.body.password;
    }

    await user.save();
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Solicitar email de recuperación de contraseña
// @route POST /auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = "Si el email existe en nuestro sistema, recibirás un enlace de recuperación en unos minutos.";

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/?resetToken=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ success: true, message: genericMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Restablecer contraseña con token
// @route POST /auth/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "El enlace de recuperación es inválido o ya expiró" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
