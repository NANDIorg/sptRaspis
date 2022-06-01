const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const searchUser = require("./searchUser")
const userInfo = require("./userInfo")
const getTaskStudent = require("./getTaskStudent")
const postAnswer = require("./postAnswer")
const authToken = require("./authToken")
const getListRaitingDiscipline = require("./getListRaitingDiscipline")
const getIdDialog = require("./getIdDialog")
const postSendMessage = require("./postSendMessage")

function index () {
    router.use(searchUser())
    router.use(userInfo())
    router.use(authToken)
    router.use(getTaskStudent)
    router.use(postAnswer)
    router.use(getListRaitingDiscipline)
    router.use(getIdDialog)
    router.use(postSendMessage)

    return router
}



module.exports = index