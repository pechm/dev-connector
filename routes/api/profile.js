import express from 'express';
import fetch from 'node-fetch';
import expressValidator from 'express-validator/check';
import auth from '../../middleware/auth';
import Profile from '../../models/Profile';
import User from '../../models/User';

const profileRouter = express.Router();

const {
  check,
  validationResult
} = expressValidator;

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
profileRouter.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/profile
// @desc   Creae or update user profile
// @access Private
profileRouter.post('/', [auth,
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

// @route  GET api/profile
// @desc   Get all users profile
// @access Public
profileRouter.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID
// @access Public
profileRouter.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'Profile not found'
      });
    }
    res.json(profile);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        msg: 'Profile not found'
      });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/profile
// @desc   Delete user profile
// @access Pirvate
profileRouter.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove user posts

    // remove user profile
    await Profile.findOneAndRemove({
      user: req.user.id
    });

    // remove user
    await User.findOneAndRemove({
      _id: req.user.id
    });

    res.json({
      msg: 'User deleted'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/profile/experience
// @desc   Add user profile experience
// @access Pirvate
profileRouter.put('/experience', [auth,
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'Date from is required').not().isEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    profile.experience.unshift(newExp);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete user profile experience
// @access Pirvate
profileRouter.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    // remove user profile
    const profile = await Profile.findOne({
      user: req.user.id
    });

    // Get remove index
    const removeIndex = profile.experience.map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/profile/education
// @desc   Add user profile education
// @access Pirvate
profileRouter.put('/education', [auth,
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  check('from', 'Date from is required').not().isEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    profile.education.unshift(newEdu);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete user profile education
// @access Pirvate
profileRouter.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    // remove user profile
    const profile = await Profile.findOne({
      user: req.user.id
    });

    // Get remove index
    const removeIndex = profile.education.map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/profile/github/:username
// @desc   Get user repos from Github
// @access Public
profileRouter.get('/github/:username', async (req, res) => {
  try {
    const gitUrl = `https://api.github.com/users/${req.params.username}/repos?per_page=5&
    sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&
    client_secret=${process.env.GITHUB_SECRET}`;
    fetch(gitUrl)
      .then(res => res.json())
      .then(json => res.json(json))
      .catch(err => {
        console.log(err);
        return res.status(404).send('No Github profile found');
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

export {
  profileRouter
}