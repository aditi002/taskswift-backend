const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const MAX_LOGIN_ATTEMPTS = 5; 
const LOCKOUT_DURATION = 15 * 60 * 1000; 

const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    email: user.email,
  };

  return jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' });
};

const login = async (req, res, next) => {
  const { username, password, isGuest } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ error: 'User is not registered' });
    }

    if (isGuest) {
      const token = generateToken(user);

      return res.json({ status: 'success', token: token });
    }

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS && Date.now() - user.lockoutTime < LOCKOUT_DURATION) {
      return res.status(401).json({ error: 'Account is temporarily locked. Please try again later.' });
    }

    bcrypt.compare(password, user.password, async (err, success) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!success) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockoutTime = Date.now();
        }

        await user.save();

        return res.status(400).json({ error: 'Password does not match' });
      }

      user.loginAttempts = 0;
      user.lockoutTime = null;

      await user.save();

      const token = generateToken(user);

      res.json({ status: 'success', token: token });
    });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
};

const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'User not logged in!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { login, verifyUser };
