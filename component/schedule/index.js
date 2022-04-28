const express = require('express')
const group = require('./group')
const router = express.Router()

function index () {
    router.use(group())

    return router
} 

module.exports = index