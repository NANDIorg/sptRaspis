const express = require('express')
const md5 = require('md5')
const router = express.Router()
const connection = require('../../lib/connetion')

router.post("/api/teacher/putMarkUser", async (req,res)=>{
    const token = md5(req.body.token)
    const idTask = req.body.idTask
    const idUser = req.body.idUser
    const mark = req.body.mark

    if (!token || !idTask || !idUser) {
        res.sendStatus(422)
        return
    }

    let error = false

    await new Promise((resolve)=>{
        connection.query(`SELECT id FROM users WHERE token = '${token}' and role = '1'`,(err,result)=>{
            if (result.length == 0) {
                error = true
            }
            resolve()
            return
        })
    })

    if (error) {
        res.sendStatus(422)
        return
    }

    await new Promise((resolve)=>{
        connection.query(`SELECT id FROM users WHERE id = '${idUser}' and role = '0'`,(err,result)=>{
            if (result.length == 0) {
                error = true
            }
            resolve()
            return
        })
    })

    if (error) {
        res.sendStatus(422)
        return
    }

    await new Promise ((resolve)=>{
        connection.query(`UPDATE taskuser SET mark = '${mark}' WHERE (idUser = '${idUser}' and idTask = '${idTask}');
        `,(err,result)=>{
            resolve()
        })
    })

    res.sendStatus(200)
})

module.exports = router