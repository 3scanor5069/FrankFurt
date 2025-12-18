// passwordController.js - CON CÓDIGO DE VERIFICACIÓN
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generar código de 6 dígitos
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// PASO 1: Enviar código de verificación
exports.sendVerificationCode = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ 
            success: false,
            message: 'El correo es requerido' 
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT idUsuario, nombre, correo FROM usuario WHERE correo = ?',
            [correo.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No existe una cuenta con ese correo'
            });
        }

        const user = rows[0];
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Guardar código en la base de datos
        await pool.query(
            'UPDATE usuario SET reset_token = ?, reset_token_expires = ? WHERE idUsuario = ?',
            [verificationCode, expiresAt, user.idUsuario]
        );

        // Enviar correo
        const mailOptions = {
            from: `"Frank Furt" <${process.env.EMAIL_USER}>`,
            to: user.correo,
            subject: '🔐 Código de Recuperación - Frank Furt',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%); padding: 30px; text-align: center; color: white; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { padding: 40px 30px; }
                        .code-box { background: #f8f9fa; border: 2px dashed #FFA500; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FF8C00; font-family: monospace; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Código de Verificación</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${user.nombre}</strong>,</p>
                            <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:</p>
                            
                            <div class="code-box">
                                <div class="code">${verificationCode}</div>
                            </div>
                            
                            <p style="text-align: center; color: #6c757d;">Este código expira en <strong>15 minutos</strong></p>
                            
                            <p>Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
                            
                            <p style="margin-top: 30px;">
                                Saludos,<br>
                                <strong>El equipo de Frank Furt</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Frank Furt. Todos los derechos reservados.</p>
                            <p>Este es un correo automático, por favor no responder.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Código de verificación enviado a tu correo',
            expiresIn: '15 minutos'
        });

    } catch (error) {
        console.error('Error al enviar código:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el código de verificación'
        });
    }
};

// PASO 2: Verificar código
exports.verifyCode = async (req, res) => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({ 
            success: false,
            message: 'Correo y código son requeridos' 
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT idUsuario, reset_token, reset_token_expires FROM usuario WHERE correo = ?',
            [correo.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        if (!user.reset_token || !user.reset_token_expires) {
            return res.status(400).json({
                success: false,
                message: 'No hay un código de verificación activo'
            });
        }

        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({
                success: false,
                message: 'El código ha expirado. Solicita uno nuevo'
            });
        }

        if (user.reset_token !== codigo.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Código incorrecto'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Código verificado correctamente'
        });

    } catch (error) {
        console.error('Error al verificar código:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el código'
        });
    }
};

// PASO 3: Restablecer contraseña
exports.resetPassword = async (req, res) => {
    const { correo, codigo, nuevaPassword } = req.body;

    if (!correo || !codigo || !nuevaPassword) {
        return res.status(400).json({ 
            success: false,
            message: 'Todos los campos son requeridos' 
        });
    }

    if (nuevaPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT idUsuario, reset_token, reset_token_expires FROM usuario WHERE correo = ?',
            [correo.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        if (!user.reset_token || user.reset_token !== codigo.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido'
            });
        }

        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({
                success: false,
                message: 'El código ha expirado'
            });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar contraseña y limpiar código
        await pool.query(
            'UPDATE usuario SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE idUsuario = ?',
            [hashedPassword, user.idUsuario]
        );

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restablecer la contraseña'
        });
    }
};

module.exports = {
    sendVerificationCode: exports.sendVerificationCode,
    verifyCode: exports.verifyCode,
    resetPassword: exports.resetPassword
};
