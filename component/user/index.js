const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const searchUser = require("./searchUser")
const userInfo = require("./userInfo")
const getTaskStudent = require("./getTaskStudent")
const postAnswer = require("./postAnswer")

function index () {
    router.use(searchUser())
    router.use(userInfo())
    router.use(getTaskStudent)
    router.use(postAnswer)

    return router
}



module.exports = index