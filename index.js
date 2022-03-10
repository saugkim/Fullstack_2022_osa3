const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

//app.use(morgan('tiny'))
morgan.token('bodyJSON', req => JSON.stringify(req.body || {}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyJSON'))


let persons = [
  {
    "name": "Arto Hellas",
    "number": "123123",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234234",    
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]
  
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person === undefined) {
    res.status(404).json({
      error: "not found"
    })
  } else {
    res.json(person)
  }  
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()  
})

app.get('/info', (req, res) => {
  const today = new Date()
  const number = persons.length
  res.send(`<p>Phonebook has info for ${number} people</p><p>${new Date()}</>`)
})

const getId = () => {
  return Math.floor(Math.random() * 100000)
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error : 'name missing'
    })
  }
  if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }

  const found = persons.find(p => p.name === body.name)

  if (found === undefined){
    console.log('person not found, added ok')
    const person = {
      name: body.name,
      number: body.number,
      id: getId()
    }
    persons = persons.concat(person)
    res.json(person)
  } else {
    console.log('status 400')
    res.status(400).json({
      error: 'name must be unique'
    })
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})