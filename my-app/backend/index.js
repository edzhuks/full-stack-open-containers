require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Entry = require('./models/entry')

app.use(express.static('build'))
app.use(express.json())
morgan.token('postbody', function (req) { return req.method==='POST'?JSON.stringify(req.body):' '})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postbody'))



app.get('/', (request, response) => {
  response.send('<h1>Phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
  Entry.find({}).then(entries => {
    response.json(entries)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Entry.findById(request.params.id)
    .then(entry => {
      if(entry){
        response.json(entry)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Entry.findByIdAndRemove(request.params.id)
    .then(entry => {
      response.status(204).json(entry)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Entry.findByIdAndUpdate(request.params.id, person, { new: true , runValidators: true, context: 'query' })
    .then(updatedEntry => {
      response.json(updatedEntry)
    })
    .catch(error => next(error))
})

app.get('/api/info', (req, res) => {
  Entry.countDocuments().then(number => {
    res.send(`Phonebook has info for ${number} people
    ${new Date()}`)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  // if (phonebook.find(p => p.name === body.name)) {
  //     return response.status(400).json({
  //         error: 'person already exists'
  //     })
  // }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Entry({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})