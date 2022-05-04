const express = require('express')
const router = express.Router()
const createUsers = require('./createUser')
const createLessons = require('./createLessons')
const createGroup = require('./createGroup')


function index () {
    router.use(createLessons())
    router.use(createUsers())
    router.use(createGroup)

    return router
}

module.exports = index