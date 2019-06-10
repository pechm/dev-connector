const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

const {
  check,
  validationResult
} = require('express-validator/check');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/profile
// @desc   Creae or update user profile
// @access Private
router.post('/', [auth,
  [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  // create user profie
  const {
    company,
    website,
    location,
    bio,
    status,
    github,
    skills,
    youtube,
    facebook,
    linkedin,
    twitter,
    instagram
  } = req.body;

  const profileFields = {};
  profileFields.user = req.user.id;

  company ? profileFields.company = company : '';
  website ? profileFields.website = website : '';
  location ? profileFields.location = location : '';
  bio ? profileFields.bio = bio : '';
  status ? profileFields.status = status : '';
  github ? profileFields.github = github : '';

  profileFields.skills = skills.split(',').map(skill => skill.trim());

  profileFields.social = {};
  youtube ? profileFields.social.youtube = youtube : '';
  facebook ? profileFields.social.facebook = facebook : '';
  linkedin ? profileFields.social.linkedin = linkedin : '';
  twitter ? profileFields.social.twitter = twitter : '';
  instagram ? profileFields.social.instagram = instagram : '';

  try {
    let profile = Profile.findOne({
      user: req.user.id
    });

    if (profile) {
      profile = await Profile.findOneAndUpdate({
        user: req.user.id
      }, {
        $set: profileFields
      }, {
        new: true
      });

      return res.json(profile);
    }

    // create new profile
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;