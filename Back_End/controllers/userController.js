// userController.js - OPTIMIZADO con mejoras de manejo de errores
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===================================================================
// FUNCIÓN: GENERAR TOKEN JWT
// ===================================================================
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.idUsuario, 
            nombre: user.nombre,
            correo: user.correo, 
            rol: user.rol 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );
}

// ===================================================================
// 1. OBTENER TODOS LOS USUARIOS
// ===================================================================
exports.getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT 
                idUsuario, 
                nombre, 
                correo, 
                telefono, 
                direccion, 
                rol,
                fecha_registro, 
                activo 
            FROM 
                usuario
            ORDER BY fecha_registro DESC
        `;
        const [rows] = await pool.query(sql);

        const users = rows.map(row => {
            const nameParts = row.nombre ? row.nombre.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            return {
                id: row.idUsuario,
                firstName: firstName,
                lastName: lastName,
                email: row.correo, // Cambiado de correo a email para consistencia con frontend
                phone: row.telefono,
                location: row.direccion,
                hobby: 'N/A',
                status: row.activo === 1 ? 'active' : 'inactive',
                dateCreated: row.fecha_registro ? 
                    new Date(row.fecha_registro).toISOString().split('T')[0] : 
                    null,
                avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
            };
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('❌ Error al obtener los usuarios:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener los usuarios', 
            error: error.message 
        });
    }
};

// ===================================================================
// 2. CREAR UN NUEVO USUARIO
// ===================================================================
exports.createUser = async (req, res) => {
    const { firstName, lastName, email, phone, location, status, rol, password } = req.body;
    
    // Validaciones en backend
    if (!firstName || !firstName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El nombre es obligatorio' 
        });
    }

    if (!lastName || !lastName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El apellido es obligatorio' 
        });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El email es obligatorio' 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'El formato del email no es válido' 
        });
    }

    const nombreCompleto = `${firstName} ${lastName}`.trim();
    const activo = status === 'active' ? 1 : 0;
    const rolAsignado = rol || 'cliente';
    const rawPassword = password || 'default_password';

    try {
        // Verificar si el email ya existe
        const [existingUser] = await pool.query(
            'SELECT correo FROM usuario WHERE correo = ?', 
            [email.trim().toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: 'El email ya está registrado' 
            });
        }

        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const sql = `
            INSERT INTO usuario (nombre, correo, telefono, direccion, password, rol, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?) 
        `;
        
        const [result] = await pool.query(sql, [
            nombreCompleto, 
            email.trim().toLowerCase(), 
            phone || null, 
            location || null, 
            hashedPassword,
            rolAsignado, 
            activo
        ]);
        
        const newUser = {
            id: result.insertId,
            firstName,
            lastName,
            email: email.trim().toLowerCase(),
            phone: phone || '',
            location: location || '',
            rol: rolAsignado,
            status,
            dateCreated: new Date().toISOString().split('T')[0],
            avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
        };

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: newUser
        });
    } catch (error) {
        console.error('❌ Error al crear el usuario:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                message: 'El email ya está registrado' 
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Error al crear el usuario', 
            error: error.message 
        });
    }
};

// ===================================================================
// 3. ACTUALIZAR UN USUARIO EXISTENTE
// ===================================================================
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, location, rol, status, password } = req.body;

    // Validaciones
    if (!firstName || !firstName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El nombre es obligatorio' 
        });
    }

    if (!lastName || !lastName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El apellido es obligatorio' 
        });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'El email es obligatorio' 
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'El formato del email no es válido' 
        });
    }

    const nombreCompleto = `${firstName} ${lastName}`.trim();
    const activo = status === 'active' ? 1 : 0;

    try {
        // Verificar que el usuario existe
        const [userExists] = await pool.query(
            'SELECT idUsuario FROM usuario WHERE idUsuario = ?', 
            [id]
        );

        if (userExists.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar si el email ya está en uso por otro usuario
        const [emailExists] = await pool.query(
            'SELECT idUsuario FROM usuario WHERE correo = ? AND idUsuario != ?', 
            [email.trim().toLowerCase(), id]
        );

        if (emailExists.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: 'El email ya está en uso por otro usuario' 
            });
        }

        let updateFields = 'nombre = ?, correo = ?, telefono = ?, direccion = ?, rol = ?, activo = ?';
        let updateValues = [
            nombreCompleto, 
            email.trim().toLowerCase(), 
            phone || null, 
            location || null, 
            rol, 
            activo
        ];

        // Actualizar contraseña solo si se proporciona
        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields += ', password = ?';
            updateValues.push(hashedPassword);
        }

        const sql = `
            UPDATE usuario
            SET ${updateFields}
            WHERE idUsuario = ?
        `;
        updateValues.push(id);

        await pool.query(sql, updateValues);

        const updatedUser = {
            id: parseInt(id),
            firstName,
            lastName,
            email: email.trim().toLowerCase(),
            phone: phone || '',
            location: location || '',
            rol,
            status,
            avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
        };

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: updatedUser
        });
    } catch (error) {
        console.error('❌ Error al actualizar el usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar el usuario', 
            error: error.message 
        });
    }
};

// ===================================================================
// 4. INACTIVAR UN USUARIO (NO ELIMINAR)
// ===================================================================
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario existe
        const [userExists] = await pool.query(
            'SELECT idUsuario, nombre, activo FROM usuario WHERE idUsuario = ?', 
            [id]
        );

        if (userExists.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar si el usuario tiene pedidos activos (pendientes o en preparación)
        const [activePedidos] = await pool.query(
            `SELECT COUNT(*) as pedidos_activos 
             FROM pedido 
             WHERE idUsuario = ? 
             AND estado IN ('pendiente', 'en_preparacion')`,
            [id]
        );

        if (activePedidos[0].pedidos_activos > 0) {
            return res.status(409).json({ 
                success: false,
                message: `No se puede inactivar el usuario porque tiene ${activePedidos[0].pedidos_activos} pedido(s) activo(s)` 
            });
        }

        // Inactivar usuario (NO eliminar)
        const sql = 'UPDATE usuario SET activo = 0 WHERE idUsuario = ?';
        await pool.query(sql, [id]);

        res.status(200).json({ 
            success: true,
            message: `Usuario "${userExists[0].nombre}" inactivado correctamente` 
        });
    } catch (error) {
        console.error('❌ Error al inactivar el usuario:', error);

        res.status(500).json({ 
            success: false,
            message: 'Error al inactivar el usuario', 
            error: error.message 
        });
    }
};

// ===================================================================
// 5. REGISTRAR UN USUARIO (Frontend/Cliente)
// ===================================================================
exports.registerUser = async (req, res) => {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Todos los campos son obligatorios' 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.status(400).json({ 
            success: false,
            message: 'El formato del email no es válido' 
        });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres' 
        });
    }

    try {
        const [existingUser] = await pool.query(
            'SELECT correo FROM usuario WHERE correo = ?', 
            [correo.trim().toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: 'El email ya está registrado' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO usuario (nombre, correo, password) VALUES (?, ?, ?)`;
        
        await pool.query(sql, [
            nombre.trim(), 
            correo.trim().toLowerCase(), 
            hashedPassword
        ]);

        res.status(201).json({ 
            success: true,
            message: 'Usuario registrado exitosamente' 
        });
    } catch (error) {
        console.error('❌ Error al registrar el usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error del servidor al registrar el usuario', 
            error: error.message 
        });
    }
};

// ===================================================================
// 6. LOGIN CON JWT
// ===================================================================
exports.loginUser = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Email y contraseña son obligatorios' 
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM usuario WHERE correo = ?', 
            [correo.trim().toLowerCase()]
        );
        
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Credenciales inválidas' 
            });
        }

        if (user.activo === 0) {
            return res.status(403).json({ 
                success: false,
                message: 'Usuario inactivo. Contacte al administrador' 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Credenciales inválidas' 
            });
        }

        // Actualizar último acceso
        await pool.query(
            'UPDATE usuario SET ultimo_acceso = NOW() WHERE idUsuario = ?', 
            [user.idUsuario]
        );

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.idUsuario,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error del servidor', 
            error: error.message 
        });
    }
};

// ===================================================================
// 7. VERIFICAR TOKEN
// ===================================================================
exports.verifyToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token no proporcionado' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ 
            success: true, 
            user: decoded 
        });
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: 'Token inválido o expirado' 
        });
    }
};

// ===================================================================
// 8. CERRAR SESIÓN (Logout)
// ===================================================================
exports.logoutUser = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Sesión cerrada correctamente' 
    });
};

// ===================================================================
// 9. OBTENER PERFIL (PROTEGIDO)
// ===================================================================
exports.getProfile = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT 
                idUsuario, 
                nombre, 
                correo, 
                telefono, 
                direccion, 
                rol,
                fecha_registro,
                ultimo_acceso,
                activo
            FROM usuario 
            WHERE idUsuario = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];
        
        // Parsear nombre completo
        const nameParts = user.nombre ? user.nombre.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        res.status(200).json({
            success: true,
            user: {
                id: user.idUsuario,
                firstName,
                lastName,
                nombre: user.nombre,
                correo: user.correo,
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                rol: user.rol,
                fecha_registro: user.fecha_registro,
                ultimo_acceso: user.ultimo_acceso,
                activo: user.activo,
                avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener el perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

// ===================================================================
// 10. ACTUALIZAR PERFIL (PROTEGIDO) - Solo información sensible
// ===================================================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { telefono, direccion } = req.body;

        // Validación básica
        if (telefono && telefono.trim().length > 0) {
            // Validar formato de teléfono (números, espacios, guiones, paréntesis, +)
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(telefono.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato del teléfono no es válido'
                });
            }
        }

        if (direccion && direccion.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: 'La dirección es demasiado larga (máximo 200 caracteres)'
            });
        }

        // Actualizar solo campos permitidos
        const sql = `
            UPDATE usuario 
            SET telefono = ?, direccion = ?
            WHERE idUsuario = ?
        `;

        await pool.query(sql, [
            telefono ? telefono.trim() : null,
            direccion ? direccion.trim() : null,
            userId
        ]);

        // Obtener datos actualizados
        const [rows] = await pool.query(
            'SELECT telefono, direccion FROM usuario WHERE idUsuario = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                telefono: rows[0].telefono,
                direccion: rows[0].direccion
            }
        });
    } catch (error) {
        console.error('❌ Error al actualizar el perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el perfil',
            error: error.message
        });
    }
};

// ===================================================================
// 11. ELIMINAR CUENTA PROPIA (PROTEGIDO) - Con verificación de contraseña
// ===================================================================
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Validar que se proporcionó la contraseña
        if (!password || !password.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar su contraseña para confirmar la eliminación'
            });
        }

        // Obtener datos del usuario incluyendo password
        const [rows] = await pool.query(
            'SELECT idUsuario, nombre, correo, password FROM usuario WHERE idUsuario = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta. No se puede eliminar la cuenta'
            });
        }

        // Eliminar el usuario
        await pool.query('DELETE FROM usuario WHERE idUsuario = ?', [userId]);

        res.status(200).json({
            success: true,
            message: 'Cuenta eliminada exitosamente. Lamentamos verte partir.'
        });
    } catch (error) {
        console.error('❌ Error al eliminar la cuenta:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar la cuenta porque tiene registros asociados. Contacte al administrador.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar la cuenta',
            error: error.message
        });
    }
};