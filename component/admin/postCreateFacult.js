const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')
const {validateUN} = require("../../lib/validateReq")
const checkAdmin = require('./checkTokenAdmin')

router.post(`/api/admin/postCreateFacult`,async (req,res)=>{
    const token = (!!req.headers.token) ? req.headers.token : undefined
    const title = req.body.title
    const shortName = req.body.shortName
    const description = req.body.description
    if (!validateUN(token) || !validateUN(title) || !validateUN(shortName) || !validateUN(description)) {
        res.status(422).send("data")
        return
    }
    const resultCheckAdmin = await checkAdmin(token)
    if (!resultCheckAdmin) {
        res.status(422).send("token")
        return
    }
    let error = false
    await new Promise((resolve)=>{
        connection.query(`INSERT INTO faculty (name, fullName, description) VALUES ('${shortName}', '${title}', '${description}')`,(err,result)=>{
            if (err) {
                error = true
                resolve()
                return
            }
            resolve()
        })
    })
    if (error) {
        res.status(422).send("mysql")
        return
    }
    res.sendStatus(200)
})

module.exports = router