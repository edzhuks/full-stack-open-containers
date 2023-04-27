import { useEffect, useState } from 'react'
import phonebookService from './services/phonebookService'

const Filter = ({ value, onChange }) => {
  return (
    <div>
      filter shown with <input value={value} onChange={onChange} />
    </div>
  )
}

const PersonForm = ({
  nameValue,
  numberValue,
  onNameChange,
  onNumberChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={nameValue} onChange={onNameChange} />
      </div>
      <div>
        number: <input value={numberValue} onChange={onNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, deletePerson }) => {
  return (
    <div>
      {persons.map((person) => (
        <div key={person.name}>
          <p>
            {person.name} {person.number}{' '}
            <button onClick={() => deletePerson(person.id)}>delete</button>
          </p>
        </div>
      ))}
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  if (message.good) {
    return <div className="success">{message.text}</div>
  }
  return <div className="error">{message.text}</div>
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [name, setNewName] = useState('')
  const [number, setNewNumber] = useState('')
  const [filterValue, setNewFilterValue] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    console.log('effect')
    phonebookService.getAll().then((persons) => {
      console.log('promise fulfilled')
      setPersons(persons)
    })
  }, [])
  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filterValue.toLowerCase())
  )

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    console.log('filtering', event.target.value)
    setNewFilterValue(event.target.value)
  }

  const updatePerson = (name) => {
    if (
      window.confirm(
        `${name} is already in the phonebook. Replace with a new number?`
      )
    ) {
      const updatedPerson = { ...persons.find((p) => p.name === name), number }
      phonebookService
        .update(updatedPerson.id, updatedPerson)
        .then((returnedPerson) => {
          setPersons(persons.map((p) => (p.name !== name ? p : returnedPerson)))
          setNewName('')
          setNewNumber('')
        })
        .catch((error) => {
          console.log(error.response.data.error)
          setMessage({ good: false, text: error.response.data.error })
          setTimeout(() => setMessage(null), 3000)
        })
    }
  }

  const addPerson = (event) => {
    event.preventDefault()
    if (persons.map((p) => p.name).includes(name)) {
      updatePerson(name)
    } else {
      const newPerson = { name, number }
      phonebookService
        .create(newPerson)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setMessage({ good: true, text: `Added ${returnedPerson.name}` })
          setTimeout(() => setMessage(null), 3000)
        })
        .catch((error) => {
          console.log(error.response.data.error)
          setMessage({ good: false, text: error.response.data.error })
          setTimeout(() => setMessage(null), 3000)
        })
    }
  }

  const deletePerson = (id) => {
    const person = persons.find((p) => p.id === id)
    if (window.confirm(`Delete ${person.name} ?`)) {
      phonebookService.remove(id).then((response) => {
        setPersons(persons.filter((p) => p.id !== id))
      })
    }
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={message} />
      <Filter value={filterValue} onChange={handleFilterChange} />
      <h1>Add new</h1>
      <PersonForm
        nameValue={name}
        numberValue={number}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
        onSubmit={addPerson}
      />
      <h1>Numbers</h1>
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
