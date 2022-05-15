const express = require('express')
const group = require('./group')
const teacher = require('./teacher')
const router = express.Router()

function index () {
    router.use(group())
    router.use(teacher)

    return router
} 

module.exports = index