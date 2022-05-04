const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g

function index () {
    router.get("/api/admin/studentInGroup", async (req, res)=>{
        const idGroup = JSON.parse(req.query.idGroup)
        console.log(JSON.parse(req.query.idGroup));
        let resultArr = []
        if (!idGroup) {
            res.status(500).send("Не все данные")
            return
        }

        for (let i = 0; i < idGroup.length; i++) {
            const el = idGroup[i];
            await new Promise((resolve) => {
                connection.query(`SELECT id, fio, image FROM users
                WHERE role = 0 and groupId = ${el}`, (err, result) => {
                    result.forEach(el2 => {
                        resultArr.push(el2)
                    })
                    resolve()
                })
            })
        }

        res.send(resultArr)
        
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

        for (let i = 0; i < teacher.length; i++) {
            const el = teacher[i];
            await new Promise((resolve, reject) => {
                connection.query(`INSERT INTO disciplineteacher (idDiscipline, idTeacher) VALUES ('${idDiscipline}', '${el}')`, (err, result) => {
                    resolve()
                })
            })
        }

        for (let i = 0; i < group.length; i++) {
            const el = group[i];
            await new Promise((resolve, reject) => {
                connection.query(`INSERT INTO disciplinestudent (idDiscipline, idGroup) VALUES ('${idDiscipline}', '${el}')`, (err, result) => {
                    resolve()
                })
            })
        }
    })

    return router
}



module.exports = index