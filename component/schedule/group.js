const express = require('express')
const md5 = require('md5')
const router = express.Router()
const connection = require('../../lib/connetion')
const createGroupSchedule = require('./createGroupSchedule')

function index () {
    
    router.get('/api/groupSchedule', (req, res) => {
        const query = req.query
        if (query.idGroup == undefined || query.date == undefined) {res.sendStatus(500)} else {
            connection.query(`SELECT * FROM sptraspis.schedulegroup WHERE idGroup = '${query.idGroup}' and date = '${query.date}'`,(err,result)=>{
                if (result.length > 0) {
                    res.send({
                        schedule : JSON.parse(result[0].scheduleJSON),
                        lastUpdate : result[0].dataUpdate
                    })
                } else {
                    res.sendStatus(403)
                }
                
            })
        }
    })

    router.post('/api/getScheduleToken', async (req,res)=>{
        const token = req.body.token
        let resultObj = {
            status : 200,
            error : "",
            groupId : 0
        }
        await new Promise((resolve) => {
            connection.query(`SELECT groupId FROM users WHERE token = '${md5(token)}'`,(err, result)=>{
                if (err) {
                    resultObj.status = 403
                    resultObj.error = "Invalide token"
                    resolve()
                    return
                }
                if (result.length == 0) {
                    resultObj.status = 403
                    resultObj.error = "Invalide token"
                    resolve()
                    return
                }
                resultObj.groupId = result[0].groupId
                resolve()
            })
        })
        res.status(resultObj.status).send(resultObj)
    })

    return router
}

module.exports = index