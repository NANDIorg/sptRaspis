const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const checkAdmin = require('./checkTokenAdmin')
const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g

router.post('/api/admin/createUser',(req,res)=>{
    const token = req.headers.token
    const body = req.body
    
    checkAdmin(token).then((result) => {   
        if (result) { 
            
        } else {
            res.sendStatus(500).send({status : 500})
        }
    })
    // res.send({body : body, token : token})
})

function index () {
    router.get("/api/admin/createUser1", (req, res) => {
        res.send("123")
    })
    
    router.get("/api/admin/createUser2", (req, res) => {
        res.send("123")
    })

    return router
}



module.exports = index