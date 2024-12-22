const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');
const db = require('../database/db-manager');

class AuthService {
    constructor() {
        this.tokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    }

    async registerUser(username, password, email) {
        try {
            // Check if user exists
            const existingUser = await db.users.findOne({ username });
            if (existingUser) {
                throw new AppError('Username already exists', 'USER_EXISTS');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = await db.users.create({
                username,
                password: hashedPassword,
                email,
                created: new Date(),
                settings: {
                    theme: 'default',
                    autoUpdate: true,
                    notifications: true
                }
            });

            logger.info('User registered successfully', { username });
            return this.generateToken(user);
        } catch (error) {
            logger.error('Registration failed', { error });
            throw new AppError('Registration failed', 'REGISTRATION_ERROR');
        }
    }

    async login(username, password) {
        try {
            const user = await db.users.findOne({ username });
            if (!user) {
                throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS');
            }

            return this.generateToken(user);
        } catch (error) {
            logger.error('Login failed', { error });
            throw new AppError('Login failed', 'LOGIN_ERROR');
        }
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, username: user.username },
            this.tokenSecret,
            { expiresIn: '24h' }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.tokenSecret);
        } catch (error) {
            throw new AppError('Invalid token', 'INVALID_TOKEN');
        }
    }
}

module.exports = new AuthService(); 