const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')

router.get("/api/admin/allStudent", async(req,res)=>{
    await new Promise((resolve)=>{
        connection.query(`SELECT id,fio as fullname,image as img FROM users WHERE role = 0`, (err, result) => {
            if (err) {
                res.sendStatus(403)
                resolve()
            }
            res.send(result)
            resolve()
        })
    })
})

module.exports = router