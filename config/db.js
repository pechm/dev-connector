import mongoose from 'mongoose'
import 'babel-polyfill'

const connectDB = async () => {
  return await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
}

export default connectDB