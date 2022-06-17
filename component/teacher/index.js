const router = require('express').Router()

const createTask = require("./createTask")
const getTask = require("./getTask")
const getAnswersTask = require("./getAnswersTask")
const getAnswerStudent = require("./getAnswerStudent")
const putMarkUser = require("./putMarkUser")
const getGradebook = require("./getGradebook")

router.use(createTask)
router.use(getTask)
router.use(getAnswersTask)
router.use(getAnswerStudent)
router.use(putMarkUser)
router.use(getGradebook)

module.exports = router