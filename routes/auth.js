const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

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

router.post('/mailSend', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists. Please change email.' });
    }

    // Generate a 6-character numerical code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Create a Nodemailer transporter using your SMTP settings
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'anjulagehan23@gmail.com', // Your email
        pass: 'pplu cpkl nqlt rtwi', // Your email app password
      },
    });

    // Set up email data
    let mailOptions = {
      from: 'anjulagehan23@gmail.com',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return res.status(400).json({ msg: 'Verification code not sent.', error });
      } else {
        // Include the code in the response
        res.status(200).json({ msg: 'Verification code sent to email.', code });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/update', auth, async (req, res) => {
  const { name, email, phone, address, nic, password, profile } = req.body;

  try {
    // Find the user by ID    
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email or nic is being updated and is unique
    if (email && email !== user.email) {
      let userEmail = await User.findOne({ email });
      if (userEmail) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
    }

    if (nic && nic !== user.nic) {
      let userNic = await User.findOne({ nic });
      if (userNic) {
        return res.status(400).json({ msg: 'NIC already exists' });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.nic = nic || user.nic;
    user.profile = profile || user.profile;

    // Hash password if it's being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user
    await user.save();

    res.json({ msg: 'User updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/delete', auth, async (req, res) => {
  try {
    // Use req.user.id to delete the authenticated user's account
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


