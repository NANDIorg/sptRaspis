const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get('/api/getFaculty', (req,res)=>{
    connection.query(`SELECT * FROM \`faculty\``,(err, result)=>{
        res.send(result)
    })
})

router.get('/api/getGroup/:id', (req,res)=>{
    const body = req.params
    console.log(body);
    connection.query(`SELECT \`id\`, \`name\` FROM \`grouptable\` WHERE \`idFaculty\` = '${body.id}'`, (err,result)=>{
        res.send(result)
    })
})

router.get('/api/getAll', async (req,res)=>{
    let arrayFaculty = []
    let arrayResult = []
    await new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM faculty`, (err,result)=>{
            arrayFaculty = result
            resolve()
        })
    })

    for (let i = 0; i < arrayFaculty.length; i++) {
        let obj = {}
        obj.id = arrayFaculty[i].id
        obj.title = arrayFaculty[i].name
        obj.groups = []
        await new Promise((resolve, reject) => {
            connection.query(`SELECT \`id\`, \`name\` FROM \`grouptable\` WHERE \`idFaculty\` = '${arrayFaculty[i].id}'`, (err,result)=>{
                result.forEach(e => {
                    obj.groups.push({
                        id : e.id,
                        name : e.name
                    })
                });
                resolve()
            })
        })
        arrayResult.push(obj)
    }

    res.send(arrayResult)
    
})

module.exports = router