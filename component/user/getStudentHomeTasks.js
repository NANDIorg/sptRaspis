const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get(`/api/student/getStudentHomeTasks`, async (req,res)=>{
    const token = (req.headers.token) ? md5(req.headers.token) : null
    if (!token) {
        res.status(422).send("data invalid")
        return
    }
    let resultArr = []
    let error = false
    await new Promise((resolve)=>{
        connection.query(`SELECT tasks.id as id, tasks.name as title, discipline.name as discipline, typetask.id as tasksType, tasks.end as deadline, typetask.title as typeTaskName FROM tasks
        JOIN taskuser ON taskuser.idTask = tasks.id and taskuser.idUser = (SELECT users.id FROM users WHERE token = @token) and taskuser.mark is NULL
        JOIN typetask ON typetask.id = tasks.type
        JOIN discipline ON discipline.id = tasks.idDiscipline
        WHERE tasks.idGroup = (SELECT users.groupId FROM users WHERE token = @token)
        limit 10`,{token : token},(err,result)=>{
            if (err) {
                error = true
                resolve()
                return
            }
            for (let i = 0; i < result.length; i++) {
                const el = result[i];
                resultArr.push({
                    id : el.id,
                    title : el.title,
                    discipline : el.discipline,
                    tasksType : el.tasksType,
                    deadline : el.deadline,
                    typeTaskName : el.typeTaskName
                })    
            }
            resolve()
        })
    })
    if (error) {
        res.status(422).send("sql invalid")
    } else {
        res.send(resultArr)
    }
})

module.exports = router