const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g

function makeUnId () {
    let text = '1234567890'
    let result = ''
    for (let i = 0; i < 10; i++) {
        result += text[getRandomInt(text.length)]
    }
    return result
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createUrlID (url, id) {
    if (url == "") {
        let result = id + makeUnId()
        return result
    } else {
        return url
    }
}

function index() {
    router.post('/api/admin/createUser', async (req, res)=>{
        // const token = req.headers.token
        const body = req.body
        console.log(body);
        // const resultCheckAdmin = await checkAdmin(token)
        let resultCheckAdmin = true
        console.log(resultCheckAdmin);
        if (resultCheckAdmin) {
            body.forEach(async el => {
                let image = `userAvatar/standartUser.png`
                await new Promise((resolve, reject) => {
                    connection.query(`INSERT INTO users (login, password, email, fio, groupId, role, image) 
                    VALUES ('${el.login}', '${el.password}', '${el.email}', '${el.fullname}', '${(el.group == null) ? 0 : el.group}', '${(el.isTeacher) ? 1 : 0}', '${image}')`,(err,result) => {
                        connection.query(`UPDATE users SET urlId = '${createUrlID(el.idUser,result.insertId)}' WHERE (id = '${result.insertId}')`,()=>{
                            resolve()
                        })
                    })  
                })
                
            })
            res.sendStatus(200)
        } else {
            res.status(500).send({error : "Token is not true"})
        }
    })

    router.get("/api/admin/getGroup",async (req, res) => {
        console.log("getGroup");
        let resultArray = []
        await new Promise((resolve) => {
            connection.query(`SELECT name, id FROM grouptable`, (err, result) => {
                if (err) res.sendStatus(500)
                result.forEach(el => {
                    resultArray.push({id : el.id, img : null, title : el.name})
                });
                resolve()
            })
        })
        res.send(resultArray)
    })

    router.get("/api/admin/getGroupInfo",async (req, res) => {
        const query = req.query
        console.log("getGroupInfo",query);

        await new Promise((resolve) => {
            connection.query(`SELECT groupTable.yearStart, groupTable.yearEnd, teacher.fio as CuratorFIO, facult.fullName as facultName, count(student.id) as countStudent FROM grouptable as groupTable
            JOIN users as teacher ON teacher.id = groupTable.idTeacher
            JOIN faculty as facult ON facult.id =  groupTable.idFaculty
            JOIN users as student ON student.groupId = groupTable.id
            where groupTable.id = ${query.groupID}`, (err, result) => {
                if (err) res.sendStatus(500)
                result.forEach(el => {
                    res.send({ facultFullName : el.facultName, CuratorFIO : el.CuratorFIO, groupYearStart : el.yearStart, groupYearEnd : el.yearEnd, countStudent : el.countStudent })
                });
                resolve()
            })
        })
    })


    return router
}

module.exports = index