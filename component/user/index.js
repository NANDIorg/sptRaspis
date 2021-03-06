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
const getAllDialog = require("./getAllDialog")
const getDialogInfo = require("./getDialogInfo")
const getStudentHomeTasks = require("./getStudentHomeTasks")

function index () {
    router.use(searchUser())
    router.use(userInfo())
    router.use(authToken)
    router.use(getTaskStudent)
    router.use(postAnswer)
    router.use(getListRaitingDiscipline)
    router.use(getIdDialog)
    router.use(postSendMessage)
    router.use(getAllDialog)
    router.use(getDialogInfo)
    router.use(getStudentHomeTasks)

    return router
}



module.exports = index