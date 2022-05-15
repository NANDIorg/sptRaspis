const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/teacher/getTask", async (req,res)=>{
    const token = md5(req.query.token)
    const idDiscipline = req.query.idDiscipline

    if (!token || !idDiscipline) {
        res.sendStatus(403)
        return
    }

    let resultArray = []

    await new Promise((resolve) => {
        connection.query(`SELECT tasks.id as taskId, tasks.name as taskName, tasks.description as taskDescription, tasks.start as published, tasks.end as dateTo, grouptable.name as nameGroup, count(taskusersanswer.id) as countAnswer, typetask.title as taskTypeName, typetask.id as typeId FROM tasks
        JOIN users as teacher ON teacher.token = '${token}'
        JOIN discipline ON discipline.id = '${idDiscipline}'
        JOIN disciplinestudent ON disciplinestudent.idDiscipline = discipline.id
        JOIN grouptable ON grouptable.id = disciplinestudent.idGroup
        JOIN users as student ON student.groupId = grouptable.id
        JOIN taskuser ON taskuser.idTask = tasks.id and taskuser.idUser = student.id
        left JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        JOIN typetask ON typetask.id = tasks.type
        WHERE tasks.idUserCreated = teacher.id
        GROUP BY tasks.id
        ORDER BY tasks.start`, (err, result)=>{
            for (let i = 0; i < result.length; i++) {
                const el = result[i];
                resultArray.push({
                    id : el.taskId,
                    title : el.taskName,
                    description : el.taskDescription,
                    published : el.published,
                    dateTo : el.dateTo,
                    countAnswer : el.countAnswer,
                    groupName : el.nameGroup,
                    typeTask : {
                        id : el.typeId,
                        title : el.taskTypeName
                    }
                })
            }
            resolve()
        })
    })
    res.send(resultArray)
})

module.exports = router