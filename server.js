import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db'

const app = express()

// configure dotenv 
let env = dotenv.config({})
if (env.error) {
  console.log('Wrong env configuration')
  process.exit(1)
}

// connect to database
try {
  connectDB()
} catch (error) {
  console.log('Could not connect to database')
  process.exit(1)
}

// init middeware
app.use(express.json({
  extended: false
}))

app.get('/', (req, res) => res.send('API Running'))

// Define Routes
import {
  router as usersRouter
} from './routes/api/users';
import {
  router as authRouter
} from './routes/api/auth';
import {
  router as profileRouter
} from './routes/api/profile';
import {
  router as postsRouter
} from './routes/api/posts';

app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/posts', postsRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))