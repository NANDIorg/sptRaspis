const express = require('express')
const router = express.Router()
const createUsers = require('./createUser')
const createLessons = require('./createLessons')
const createGroup = require('./createGroup')
const getControlsValues = require('./getControlsValues')
const postUpdateSchedule = require('./postUpdateSchedule')


function index () {
    router.use(createLessons())
    router.use(createUsers())
    router.use(createGroup)
    router.use(getControlsValues)
    router.use(postUpdateSchedule)

    return router
}

module.exports = index