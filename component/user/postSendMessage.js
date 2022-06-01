const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')
const multer  = require("multer");
const clients = require("../../websocket/client")

router.post("/api/sendMessage", async (req,res)=>{
    const body = req.body
    const token = (body.token) ? md5(body.token) : NULL
    const messageText = body.message
    const idDialog = body.idDialog
})

module.exports = router