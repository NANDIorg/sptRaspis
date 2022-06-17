const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')

router.get("/api/admin/createGroup/allStudent", async(req,res)=>{
    await new Promise((resolve)=>{
        connection.query(`SELECT id,fio as fullname,image FROM users WHERE role = 0 and groupId = 0`, (err, result) => {
            if (err) {
                res.sendStatus(403)
                resolve()
            }
            res.send(result)
            resolve()
        })
    })
})  
router.get("/api/admin/createGroup/getTeacher", async(req,res)=>{
    await new Promise((resolve)=>{
        connection.query(`SELECT id,fio as fullname,image FROM users where role = 1`, (err, result) => {
            if (err) {
                res.sendStatus(403)
                resolve()
            }
            res.send(result)
            resolve()
        })
    })
})

router.get("/api/admin/createGroup/getFacultet", async(req,res)=>{
    await new Promise((resolve)=>{
        connection.query(`SELECT id, fullName as title FROM faculty`, (err, result) => {
            if (err) {
                res.sendStatus(403)
                resolve()
            }
            res.send(result)
            
            resolve()
        })
    })
})

router.post("/api/admin/createGroup/createGroup", async(req,res)=>{
    const token = req.headers.token
    // const resultCheckAdmin = await checkAdmin(token)
    let resultCheckAdmin = true

    if (!resultCheckAdmin) {
        res.sendStatus(404)
        return
    }

    const body = req.body
    const title = body.title
    const expiration = body.expiration
    const entrance = body.entrance
    const teacher = body.teacher
    const faculty = body.faculty
    const students = body.students

    let error = false

    await new Promise((resolve)=>{
        connection.query(`SELECT * FROM grouptable where name = '${title}'`, (err,result)=>{
            if (err) {
                error = true
                resolve()
            }
            if (result.length > 0) {
                error = true
                resolve()
            }
            resolve()
        })
    })

    if (error) {
        res.status(403).send("Такое название уже существует")
        return
    }

    let groupid = 0

    await new Promise((resolve)=>{
        connection.query(`INSERT INTO grouptable (name, yearStart, yearEnd, idFaculty, idTeacher) VALUES ('${title}', '${entrance}', '${expiration}', '${faculty}', '${teacher}')`, (err, result) => {
            if (err) {
                error = true
                res.sendStatus(403)
                resolve()
            }
            groupid = result.insertId
            resolve()
        })
    })

    if (error) return

    for (let i = 0; i < students.length; i++) {
        const el = array[i];
        await new Promise((resolve) => {
            connection.query(`UPDATE users SET groupId = '${groupid}' WHERE (id = '${el}')`)
        })
    }
})

module.exports = router