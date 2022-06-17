const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.post("/api/authToken",async (req,res)=>{
    const token = req.body.token
    if (!token) {
        res.status(422).send("data invalid")
        return
    }
    await new Promise((resolve)=>{
        connection.query(`SELECT * FROM users WHERE token = '${md5(token)}'`,(err,result)=>{
            if (result.length > 0) {
                res.send({
                    token : token,
                    role : result[0].role
                })
                resolve()
                return
            }
            res.status(422).send("token invalid")
            resolve()
        })
    })
})

module.exports = router