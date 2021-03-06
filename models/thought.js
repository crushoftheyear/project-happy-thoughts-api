import mongoose from 'mongoose'

const thoughtSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 140
    },
    hearts: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: () => new Date()
    },
    name: {
      type: String,
      trim: true,
      default: 'anonymous',
      minlength: 1,
      maxlength: 30
    }
  }
)

module.exports = mongoose.model('Thought', thoughtSchema)