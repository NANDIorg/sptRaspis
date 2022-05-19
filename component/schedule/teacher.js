const express = require('express')
const md5 = require('md5')
const router = express.Router()
const connection = require('../../lib/connetion')
const createTeacherSchedule = require('./createTeacherSchedule')

router.get("/api/schedule/getTeacher",async (req,res)=>{
    let resultArray = []
    await new Promise ((resolve)=>{
        connection.query(`SELECT scheduleteacher.idTeacher,users.fio FROM scheduleteacher
        JOIN users ON users.id = scheduleteacher.idTeacher
        group by scheduleteacher.idTeacher`,(err,result)=>{
            result.forEach(el => {
                resultArray.push({
                    id : el.idTeacher,
                    fullname : el.fio
                })
            });
            resolve()
        })
    })
    res.send(resultArray)
})

router.get("/api/schedule/getTeacherSchedule",async (req,res)=>{
    const idTeacher = req.query.idTeacher
    const date = req.query.date

    if (!idTeacher || !date) {
        res.send(422)
        return
    }

    await new Promise ((resolve)=>{
        connection.query(`SELECT scheduleJSON,dataUpdate FROM scheduleteacher WHERE idTeacher = '${idTeacher}' and date = '${date}'`,(err,result)=>{
            if (result.length == 0) {
                res.sendStatus(422)
                resolve()
                return
            }
            res.send({
                schedule : JSON.parse(result[0].scheduleJSON),
                lastUpdate : result[0].dataUpdate
            })
        })
    })
})

router.get("/api/schedule/getScheduleTeacherToken",async (req,res)=>{
    const token = md5(req.query.token)

    if (!token) {
        res.sendStatus(422)
        return
    }

    let idTeacher = 0
    let error = false

    await new Promise((resolve)=>{
        connection.query(`SELECT scheduleteacher.idTeacher as idTeacher FROM users
        JOIN scheduleteacher ON scheduleteacher.idTeacher = users.id
        where token = '${token}'
        group by scheduleteacher.idTeacher`,(err,result)=>{
            if (result.length == 0 || err) {
                error = true
                resolve()
                return
            }
            idTeacher = result[0].idTeacher
            resolve()
        })
    })

    if (error) {
        res.status(422).send(idTeacher)
        console.log(error);
        return
    }

    res.send({idTeacher : idTeacher})
    
})

module.exports = router