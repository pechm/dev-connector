import express from 'express';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import expressValidator from 'express-validator/check';

const router = express.Router();

import {
  User
} from '../../models/User';

const {
  check,
  validationResult
} = expressValidator;

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    .isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      password
    } = req.body;

    try {
      // Check if User exis
      let user = await User.findOne({
        email: email
      });

      if (user) {
        return res.status(400).json({
          erros: [{
            msg: 'User alredy exist'
          }]
        });
      }
      // get User gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET, {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          return res.json({
            token
          });
        });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  });

export {
  router
};