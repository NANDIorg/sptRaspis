const express = require('express')
const router = express.Router()
const createUsers = require('./createUser')
const createLessons = require('./createLessons')

function index () {
    router.use(createLessons())
    router.use(createUsers())

    return router
}

module.exports = index