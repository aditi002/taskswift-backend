const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  register: (req, res, next) => {
    const { username, password, fullname, email } = req.body;

    User.findOne({ username: username })
      .then((user) => {
        if (user) return res.status(400).json({ error: 'Duplicated username!' });

        bcrypt.hash(password, 10, (err, hash) => {
          if (err) return res.status(500).json({ error: err.message });

          User.create({ username, password: hash, fullname, email })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch(next);
        });
      })
      .catch(next);
  },

  login: async (req, res, next) => {
    const { username, password, isGuest } = req.body;

    try {
      if (isGuest) {
        // Handle guest login
        let user = await User.findOne({ username: 'guest' });

        if (!user) {
          const hashedPassword = await bcrypt.hash('guestpassword', 10);
          user = await User.create({ username: 'guest', password: hashedPassword });
        }

        const payload = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
        };

        jwt.sign(
          payload,
          process.env.SECRET,
          { expiresIn: '1d' },
          (err, token) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', token: token });
          }
        );
      } else {
        // Handle regular login
        const user = await User.findOne({ username: username });

        if (!user) return res.status(400).json({ error: 'User is not registered' });

        if (!isGuest && !password) {
          // For regular login, check if the password is provided
          return res.status(400).json({ error: 'Password is required' });
        }

        if (!isGuest) {
          // For regular login, compare the password
          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            if (user.loginAttempts >= 3) {
              user.isLocked = true;
              await user.save();
              return res.status(401).json({ error: 'Account locked. Too many failed login attempts.' });
            }

            await user.save();

            return res.status(400).json({ error: 'Password does not match' });
          }

          user.loginAttempts = 0;
          await user.save();
        }

        const payload = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
        };

        jwt.sign(
          payload,
          process.env.SECRET,
          { expiresIn: '1d' },
          (err, token) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'success', token: token });
          }
        );
      }
    } catch (error) {
      next(error);
    }
  },

  getUserProfile: (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
        };

        res.json(userProfile);
      })
      .catch(next);
  },

  updateUserProfile: (req, res, next) => {
    const userId = req.user.id;
    const { username, fullname, email } = req.body;

    User.findByIdAndUpdate(userId, { username, fullname, email }, { new: true })
      .then((user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedUserProfile = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
        };

        res.json(updatedUserProfile);
      })
      .catch(next);
  },

  updateUserProfilePicture: async (req, res, next) => {
    const userId = req.user.id;

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const profilePicture = req.file.filename;

      await User.findByIdAndUpdate(userId, { profilePicture });

      res.json({ message: 'Profile picture updated successfully' });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      next(error);
    }
  }
};
