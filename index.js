
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

//app.use(morgan('tiny'))
morgan.token('bodyJSON', req => JSON.stringify(req.body || {}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyJSON'))

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(returned => {
      res.json(returned)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
  // const person = persons.find(person => person.id === Numer(req.params.id))
  // if (person === undefined) {
  //   res.status(404).json({
  //     error: "not found"
  //   })
  // } else {
  //   res.json(person)
  // }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
// app.delete('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   persons = persons.filter(person => person.id !== id)
//   res.status(204).end()
// })

app.get('/info', (req, res) => {
  Person
    .estimatedDocumentCount({})
    .then(r => {
      res.send(`<p>Phonebook has info for ${r} people</p><p>${new Date()}</>`)
    })
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  Person
    .find({ name: body.name })
    .then(result => {
      if(result.length === 0) {
        const person = new Person ({
          name: body.name,
          number: body.number,
        })
        person
          .save()
          .then(returned => res.json(returned))
          .catch(error => next(error))
      } else {
        res.status(400).json({
          error: 'name must be unique'
        })
      }
    })
})

// const body = req.body
// if (!body.name || !body.number) {
//   return res.status(400).json({
//     error : 'value is missing'
//   })
// }
// const found = persons.find(p => p.name === body.name)
// if (found === undefined){
//   console.log('person not found, added ok')
//   const person = {
//     name: body.name,
//     number: body.number,
//     id: getId()
//   }
//   persons = persons.concat(person)
//   res.json(person)
// } else {
//   console.log('status 400')
//   res.status(400).json({
//     error: 'name must be unique'
//   })
// }


app.put('/api/persons/:id', (req, res, next) => {

  const { name, number } = req.body
  Person
    .findByIdAndUpdate(req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
    .then(returned => {
      console.log(returned)
      res.json(returned)
    })
    .catch(error => {
      next(error)
    })
  // const idx = Number(req.params.id)
  // const body = req.body
  // const updated = {
  //   name: body.name,
  //   number: body.number,
  //   id: idx
  // }
  // persons = persons.map( p => p.id === idx ? updated : p)
  // res.json(persons)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)


//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
