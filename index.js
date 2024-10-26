const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('ui'))
app.use(cors())
app.use(express.json())

morgan.token('person', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return null
})

const tiny = ':method :url :status :res[content-length] - :response-time ms'
app.use(morgan(tiny + 'tiny :person'))

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.find({ _id: request.params.id }).then(persons => {
    response.json(persons)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.deleteOne({ _id: request.params.id }).then(result => {
    response.status(204).end()
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
