const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g

function index () {
    router.get("/api/admin/studentInGroup", async (req, res)=>{
        const idGroup = req.query.idGroup

        if (!idGroup) {
            res.status(500).send("Не все данные")
            return
        }

        await new Promise((resolve, reject) => {
            connection.query(`SELECT id, fio, image FROM users
            WHERE role = 0 and groupId = ${idGroup}`,(err,result)=>{
                res.send(result)
                resolve()
            })
        })
    })

    router.post("/api/admin/createDist", async (req, res) => {
        const token = req.headers.token
        const body = req.body

        if (body.number && body.title && body.type && body.teacher && body.group) {
            res.sendStatus(403)
            return
        }
        
        const nameDiscipline = body.number + body.title
        const type = body.type
        const teacher = body.teacher
        const group = body.group 
        
        if (nameDiscipline.length != 0 && type.length != 0 && teacher.length != 0 && group.length != 0) {
            res.sendStatus(403)
            return
        }

        // const resultCheckAdmin = await checkAdmin(token)
        let resultCheckAdmin = true
        console.log(resultCheckAdmin);
        
        if (!resultCheckAdmin) {
            res.status(500).send("Нельзя")
            return
        }

        let idDiscipline = 0

        await new Promise((resolve, reject) => {
            connection.query(`INSERT INTO discipline (name, type) VALUES ('${nameDiscipline}', '${type}')`, (err, result) => {
                idDiscipline = result.insertId
                resolve()
            })
        })

        await teacher.forEach(async el => {
            await new Promise((resolve, reject) => {
                connection.query(`INSERT INTO disciplineteacher (idDiscipline, idTeacher) VALUES ('${idDiscipline}', '${el}')`, (err, result) => {
                    resolve()
                })
            })
        })

        await group.forEach(async el => {
            await new Promise((resolve, reject) => {
                connection.query(`INSERT INTO disciplinestudent (idDiscipline, idGroup) VALUES ('${idDiscipline}', '${el}')`, (err, result) => {
                    resolve()
                })
            })
        })
    })

    return router
}



module.exports = index