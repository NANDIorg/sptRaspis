const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const searchUser = require("./searchUser")
const userInfo = require("./userInfo")

function index () {
    router.use(searchUser())
    router.use(userInfo())

    return router
}



module.exports = index