const express = require('express')
const { Todo } = require('../mongo')
const { setAsync, getAsync } = require('../redis')
const router = express.Router()

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos)
})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  })
  const todos = await getAsync('todos')
  await setAsync('todos', (todos ? parseInt(todos) : 0) + 1)
  res.send(todo)
})

/* GET todos listing. */
router.get('/statistics', async (_, res) => {
  const todos = await getAsync('todos')
  res.send({ added_todos: todos ?? 0 })
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  res.sendStatus(200)
})

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo)
})

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  let todo = await Todo.updateOne(
    { text: req.body.text },
    { done: req.body.done }
  )
  res.send(todo)
  return
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router
