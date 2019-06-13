import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import expressValidator from 'express-validator/check';
import auth from '../../middleware/auth';
import User from '../../models/User';

const authRouter = express.Router();

const {
  check,
  validationResult
} = expressValidator;

// @route  GET api/auth
// @desc   Test route
// @access Public
authRouter.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
authRouter.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      email,
      password
    } = req.body;

    try {
      // Check if User exis
      let user = await User.findOne({
        email: email
      });

      if (!user) {
        return res.status(400).json({
          erros: [{
            msg: 'Invalid Credentials'
          }]
        });
      }

      const isMatchPass = await bcrypt.compare(password, user.password);
      if (!isMatchPass) {
        return res.status(400).json({
          erros: [{
            msg: 'Invalid Credentials'
          }]
        });
      }

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
  authRouter
}