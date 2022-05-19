const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const md5 = require('md5')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g
const {validateUN} = require("../../lib/validateReq")

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
        let resultArray = []
        const token = req.headers.token
        const body = req.body
        if (!validateUN(token)) {
            res.status(500).send("Token invalid")
            return
        }
        const resultCheckAdmin = await checkAdmin(token)
        // console.log(resultCheckAdmin);
        let status = 200
        if (resultCheckAdmin) {
            for (let i = 0; i < body.length; i++) {
                const el = body[i]
                let error = []
                console.log(el);
                if (!el.login || !el.password || !el.fullname || el.group === undefined || el.isTeacher === undefined || el.isTeacher === null || el.idUser === undefined || el.idUser === null || el.email === undefined || el.email === null) {
                    status = 422
                    if (!el.login) {
                        error.push("login")
                    }
                    if (!el.password) {
                        error.push("password")
                    }
                    if (!el.fullname) {
                        error.push("fullname")
                    }
                    if (el.email === undefined || el.email === null) {
                        error.push("email")
                    }
                    if (el.group === undefined) {
                        error.push("group")
                    }
                    if (el.isTeacher === undefined || el.isTeacher === null) {
                        error.push("isTeacher")
                    }
                    if (el.idUser === undefined || el.idUser === null) {
                        error.push("fullname")
                    }
                    resultArray.push({
                        id : el.id,
                        err : error
                    })
                    continue
                }
                let errLogin = false
                await new Promise((resolve)=>{
                    connection.query(`SELECT id FROM users WHERE login = '${el.login}'`,(err,result)=>{
                        if (err) {
                            errLogin = true
                            error.push("login")
                            resolve()
                            return
                        }
                        if (result.length > 0) {
                            errLogin = true
                            error.push("login")
                            resolve()
                            return
                        }
                        resolve()
                    })
                })

                if (errLogin) {
                    status = 422 
                }

                await new Promise((resolve)=>{
                    connection.query(`SELECT id FROM users WHERE urlId = '${el.idUser}'`,(err,result)=>{
                        if (err) {
                            errLogin = true
                            error.push("url")
                            resolve()
                            return
                        }
                        if (result.length > 0) {
                            errLogin = true
                            error.push("url")
                            resolve()
                            return
                        }
                        resolve()
                    })
                })

                if (errLogin) {
                    status = 422
                    resultArray.push({
                        id : el.id,
                        err : error
                    })
                    continue
                }
                let image = `userAvatar/standartUser.png`
                if (el.idUser.length == 0) {
                    await new Promise((resolve, reject) => {
                        connection.query(`INSERT INTO users (login, password, email, fio, groupId, role) 
                        VALUES ('${el.login}', '${md5(el.password)}', '${el.email}', '${el.fullname}', '${(el.group == null) ? 0 : el.group}', '${(el.isTeacher) ? 1 : 0}')`,(err,result) => {
                            connection.query(`UPDATE users SET urlId = '${createUrlID(el.idUser,result.insertId)}' WHERE (id = '${result.insertId}')`,()=>{
                                resolve()
                            })
                        })  
                    })
                } else {
                    await new Promise((resolve, reject) => {
                        connection.query(`INSERT INTO users (login, password, email, fio, groupId, role, urlId) 
                        VALUES ('${el.login}', '${md5(el.password)}', '${el.email}', '${el.fullname}', '${(el.group == null) ? 0 : el.group}', '${(el.isTeacher) ? 1 : 0}', '${el.idUser}')`,(err,result) => {
                            resolve()
                        })  
                    })
                }
                
            }
            res.status(status).send(resultArray)
            console.log(resultArray);
        } else {
            res.status(500).send({error : "Token is not true"})
        }
    })

    router.get("/api/admin/getGroup",async (req, res) => {
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

        await new Promise((resolve) => {
            connection.query(`SELECT groupTable.yearStart, groupTable.yearEnd, teacher.fio as CuratorFIO, facult.fullName as facultName, count(student.id) as countStudent FROM grouptable as groupTable
            JOIN users as teacher ON teacher.id = groupTable.idTeacher
            JOIN faculty as facult ON facult.id =  groupTable.idFaculty
            JOIN users as student ON student.groupId = groupTable.id
            where groupTable.id = '${query.groupID}'`, (err, result) => {
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