const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get('/getFaculty', (req,res)=>{
    connection.query(`SELECT * FROM \`faculty\``,(err, result)=>{
        res.send(result)
    })
})

module.exports = router