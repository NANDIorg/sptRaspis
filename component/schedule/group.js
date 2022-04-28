const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const createGroupSchedule = require('./createGroupSchedule')

function index () {
    router.get('/api/groupSchedule', (req, res) => {
        const query = req.query
        if (query.idGroup == undefined || query.date == undefined) {res.sendStatus(500)} else {
            connection.query(`SELECT * FROM \`schedulegroup\` WHERE \`idGroup\` = '${query.idGroup}' and \`date\` = '${query.date}'`,(err,result)=>{
                if (result.length > 0) {
                    res.send({
                        schedule : JSON.parse(result[0].scheduleJSON),
                        dateUpdate : result[0].dataUpdate
                    })
                } else {
                    res.sendStatus(500)
                }
                
            })
        }
    })

    return router
}

module.exports = index