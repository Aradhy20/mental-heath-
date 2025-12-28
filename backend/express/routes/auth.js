const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Helper function to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Config helper
const getJwtSecret = () => process.env.JWT_SECRET || 'mindful_ai_secret_key_2025';

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone } = req.body;

        if (!username || !email || !password || !full_name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing fields with helpful messages
        let userByUsername = await User.findOne({ username });
        if (userByUsername) return res.status(400).json({ message: 'Username is already taken' });

        let userByEmail = await User.findOne({ email });
        if (userByEmail) return res.status(400).json({ message: 'Email is already registered' });

        if (phone) {
            let userByPhone = await User.findOne({ phone: phone.trim() });
            if (userByPhone) return res.status(400).json({ message: 'Phone number is already registered' });
        }

        const user = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password,
            full_name: full_name.trim(),
            phone: phone ? phone.trim() : undefined
        });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({
                token,
                user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, phone: user.phone }
            });
        });
    } catch (err) {
        console.error('Registration Error:', err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages[0] });
        }
        res.status(500).json({
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user via Email/Username & Password
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide credentials' });
        }

        // Find user by email OR username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase().trim() },
                { username: identifier.trim() }
            ]
        }).select('+password');

        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone
                }
            });
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({
            message: 'Login session failed',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        });
    }
});

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// @route   POST api/auth/request-otp
// @desc    Generate and send OTP (Email or Phone)
// @access  Public
router.post('/request-otp', async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({ message: 'Phone number or Email required' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase().trim() });
        } else if (phone) {
            user = await User.findOne({ phone: phone.trim() });
        }

        if (!user) {
            return res.status(404).json({ message: 'Account not found. Please register first.' });
        }

        // Save OTP
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP
        if (email) {
            if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
                console.log(`[AUTH-DEBUG] Email credentials missing. OTP for ${email}: ${otp}`);
                return res.json({
                    message: `OTP generated internally (SMTP not configured)`,
                    debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
                });
            }

            const mailOptions = {
                from: `"MindfulAI Security" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: '🔐 Your MindfulAI Security Code',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
                        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #4f46e5; margin-top: 0;">Identity Verification</h2>
                            <p style="color: #4b5563;">Your single-use security code is:</p>
                            <div style="background: #eef2ff; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #312e81;">${otp}</span>
                            </div>
                            <p style="color: #6b7280; font-size: 12px;">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            res.json({ message: `OTP sent to ${email}` });

        } else if (phone) {
            // PHONE: Send SMS via Twilio
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
                const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

                await client.messages.create({
                    body: `Your MindfulAI verification code is: ${otp}. Valid for 10 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone.trim()
                });

                res.json({ message: `OTP sent to ${phone}` });
            } else {
                console.log(`[AUTH-DEBUG] Twilio credentials missing. OTP for ${phone}: ${otp}`);
                res.json({
                    message: `OTP generated (SMS not configured)`,
                    debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
                });
            }
        }

    } catch (err) {
        console.error('OTP Request Error:', err.message);
        res.status(500).json({
            message: 'Failed to request OTP',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        });
    }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and login
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, email, otp } = req.body;

        if ((!phone && !email) || !otp) {
            return res.status(400).json({ message: 'Email/Phone and OTP required' });
        }

        let query = { otp, otpExpires: { $gt: new Date() } };
        if (email) query.email = email.toLowerCase().trim();
        else if (phone) query.phone = phone.trim();

        const user = await User.findOne(query);

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // Clear OTP
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone
                }
            });
        });
    } catch (err) {
        console.error('OTP Verify Error:', err.message);
        res.status(500).json({
            message: 'OTP Verification failed',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        });
    }
});

module.exports = router;

