const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get(`/api/admin/getControlsValues`, async (req,res) => {
    await new Promise((resolve)=>{
        connection.query(`SELECT (SELECT dataUpdate FROM schedulegroup order by dataUpdate DESC limit 1) as dateUpdate, count(users.id) as countUsers, (select count(tasks.id) FROM tasks) as countTasks FROM users`,(err,result)=>{
            if (result.length == 0) {
                res.send({
                    dateUpdate : Date("1970-01-01"),
                    countUsers : 0,
                    countTasks : 0
                })
            } else {
                res.send({
                    dateUpdate : result[0].dateUpdate,
                    countUsers : result[0].countUsers,
                    countTasks : result[0].countTasks
                })
            }
            resolve()
        })
    })
})

module.exports = router