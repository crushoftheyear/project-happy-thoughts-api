import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import Thought from './models/thought'


const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise


// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

const listEndpoints = require('express-list-endpoints')

const error_couldNotSave = 'Could not save thought to the database'
const error_notFound = 'Thought was not found'


// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

// Get thoughts
app.get('/thoughts', async (req, res) => {
  const { page, sort } = req.query

  const pageNum = +page || 1
  const perPage = 20
  const skip = perPage * (pageNum - 1)

  const allThoughts = await Thought.find()
  const pages = Math.ceil(allThoughts.length / perPage)

  // Sort thoughts based on sort query
  const sorting = (sort) => {
    if (sort === 'likes') {
      return { hearts: -1 }
    } else if (sort === 'newest') {
      return { createdAt: 'desc' }
    } else if (sort === 'oldest') {
      return { createdAt: 'asc' }
    }
  }

  // Apply sorting & set limit to 20
  const thoughts = await Thought.find()
    .sort(sorting(sort))
    .limit(perPage)
    .skip(skip)
    .exec()

  res.json({ thoughts, pages })
})

// Post new Thought
app.post('/thoughts', async (req, res) => {
  // Retrieve information from client to endpoint
  const { message, name } = req.body

  // Create DB entry
  const thought = new Thought({ message, name })

  try {
    // Success
    const savedThought = await thought.save()
    res.status(201).json(savedThought)
  } catch (err) {
    res.status(400).json({ message: error_couldNotSave, error: err.errors })
  }
})

// Like thought (POST because did as instructed in the codealong – could this be changed into a PUT though?)
app.post('/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params

  try {
    // Success – update thought by id & increment hearts value w/ 1
    await Thought.updateOne({ '_id': thoughtId }, { '$inc': { 'hearts': 1 } })
    res.status(201).json()
  } catch (err) {
    res.status(404).json({ message: error_notFound, error: err.errors })
  }

})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
