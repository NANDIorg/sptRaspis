const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g

function index() {
    router.post('/api/admin/createUser', async(req, res)=>{
        const token = req.headers.token
        const body = req.body
        res.send(body)
        // const resultCheckAdmin = await checkAdmin(token)
        // console.log(resultCheckAdmin);
        // if (resultCheckAdmin) {
        //     body.users.forEach(async el => {
        //         let image = `userAvatar/standartUser.png`
        //         await new Promise((resolve, reject) => {
        //             connection.query(`INSERT INTO users (login, password, email, fio, groupId, role, urlId, image) 
        //             VALUES ('${el.login}', '${el.password}', '${el.email}', '${el.fullname}', '${el.group}', '${(el.isTeacher) ? 1 : 0}', '${el.idUser}','${image}')`)  
        //             resolve()
        //         })
                
        //     })
        //     res.sendStatus(200)
        // } else {
        //     res.status(500).send({error : "Token is not true"})
        // }
    })

    router.get("/api/admin/getGroup",async (req, res) => {
        let resultArray = []
        await new Promise((resolve) => {
            connection.query(`SELECT name, id FROM grouptable`, (result) => {
                result.forEach(el => {
                    resultArray.push({id : el.name, img : null, title : el.name})
                });
                resolve()
            })
        })
        res.send(resultArray)
    })

    router.get("/api/admin/getGroupInfo",async (req, res) => {
        const query = req.query

        await new Promise((resolve) => {
            connection.query(`SELECT groupTable.yearStart, groupTable.yearEnd, teacher.fio as CuratorFIO, facult.fullName as facultName, count(student.id) as countStudent FROM grouptable as groupTable
            JOIN users as teacher ON teacher.id = groupTable.idTeacher
            JOIN faculty as facult ON facult.id =  groupTable.idFaculty
            JOIN users as student ON student.groupId = groupTable.id
            where groupTable.id = ${query.groupID}`, (result) => {
                result.forEach(el => {
                    resultArray.push({ facultFullName : el.facultName, CuratorFIO : el.CuratorFIO, groupYearStart : el.yearStart, groupYearEnd : el.yearEnd, countStudent : el.countStudent })
                });
                resolve()
            })
        })
    })


    return router
}

module.exports = index