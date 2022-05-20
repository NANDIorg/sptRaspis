const express = require('express')
const md5 = require('md5')
const connection = require('../../lib/connetion')
const router = express.Router()
const updateStudent = require("./updateGroupSchedule")
const updateTeacher = require("./updateTeacherSchedule")

router.post(`/api/admin/updateSchedule`,async (req,res)=>{
    const token = md5(req.body.token)
    if (!token) {
        res.sendStatus(422)
        return
    }
    await new Promise((resolve)=>{
        connection.query(`SELECT role FROM users WHERE token = "${token}"`,(err,result)=>{
            if (result.length == 0) {
                role = 0
            } else {
                role = result[0].role
            }
            resolve()
        })
    })
    if (role != 2) {
        res.sendStatus(422)
        return
    }
    try {
        await updateStudent()
        await updateTeacher()    
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.status(403).send(err)
    }
})

module.exports = router