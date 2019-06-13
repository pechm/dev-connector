import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  // get token from header
  const token = req.header('x-auth-token')

  // check if no token
  if (!token) {
    return res.status(401).json({
      msg: 'No token, auth failed'
    })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded.user
    next()
  } catch (err) {
    return res.status(401).json({
      msg: 'Token is not valid'
    })
  }
}