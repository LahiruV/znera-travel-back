const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail'
  auth: {
    user: 'intlahiruvimukthi@gmail.com',
    pass: 'Dula0778923789'
  }
});

router.post('/mailSend', async (req, res) => {
  const { email } = req.body;  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists. Please change email.' });
    }
    
    // Generate a 6-character numerical code
    const code = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: 'intlahiruvimukthi@gmail.com',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}`
    };
    
    // Introduce a 3-second delay before sending the email
    setTimeout(() => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email sending failed:', error);
          return res.status(500).json({ msg: 'Failed to send verification code' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ msg: 'Verification code sent to email.' });
        }
      });
    }, 3000); // 3000 milliseconds = 3 seconds

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { name, email, phone, address, nic, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists. Please change email.' });
    }

    let usern = await User.findOne({ nic });
    if (usern) {
      return res.status(400).json({ msg: 'User already exists. Please change NIC.' });
    }

    user = new User({
      name, email, phone, address, nic, password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
