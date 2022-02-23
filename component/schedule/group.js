const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const createGroupSchedule = require('./createGroupSchedule')

router.get('/api/groupScgedule', (req, res) => {
    const query = req.query
    console.log(query);
    connection.query(`SELECT * FROM \`schedulegroup\` WHERE \`idGroup\` = '${query.idGroup}' and \`date\` = '${query.date}'`,(err,result)=>{
        console.log(result);
        if (result.length > 0) {
            res.send({
                status : 200,
                schedule : JSON.parse(result[0].scheduleJSON),
                dateUpdate : result[0].dataUpdate
            })
        } else {
            res.send({
                status : 404
            })
        }
        
    })
})

module.exports = router