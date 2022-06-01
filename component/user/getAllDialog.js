const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/user/getAllDialog",async (req,res)=>{
    const token = (req.query.token) ? md5(req.query.token) : null

    await new Promise((resolve)=>{
        connection.query(`SELECT dialogusers.idDialog as idDialog, dialog.image as dialogImage, dialog.name as dialogName, dialog.isPersonal, dialoginfo.textMessage as dialogText, dialoginfo.idUser, dialoginfo.dateMessage
        FROM dialogusers
        JOIN dialog ON dialog.id = dialogusers.idDialog
        WHERE dialogusers.idUser = (SELECT id FROM users WHERE token = '${token}')`,(err,result)=>{

        })
    })
})

module.exports = router