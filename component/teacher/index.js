const router = require('express').Router()

const createTask = require("./createTask")
const getTask = require("./getTask")
const getAnswersTask = require("./getAnswersTask")
const getAnswerStudent = require("./getAnswerStudent")
const putMarkUser = require("./putMarkUser")

router.use(createTask)
router.use(getTask)
router.use(getAnswersTask)
router.use(getAnswerStudent)
router.use(putMarkUser)

module.exports = router