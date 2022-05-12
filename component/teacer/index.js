const router = require('express').Router()

const createTask = require("./createTask")
const getTask = require("./getTask")
const getAnswersTask = require("./getAnswersTask")

router.use(createTask)
router.use(getTask)
router.use(getAnswersTask)

module.exports = router