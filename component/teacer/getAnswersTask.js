const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get("/api/teacher/getAnswersTask", async (req, res) => {
    const idTask = req.query.idTask

    let resultObj = {}

    if (!idTask) {
        res.sendStatus(422)
        return
    }

    await new Promise((resolve)=>{
        connection.query(`SELECT tasks.name as taskTitle, tasks.start as taskPublished, tasks.end as taskDateTo, typetask.id as typeID, typetask.title as typeTitle, grouptable.name as groupTitle, count(taskusersanswer.id) as answerCount, 
        discipline.name as disciplineTitle FROM tasks
        JOIN typetask ON typetask.id = tasks.type
        JOIN grouptable ON grouptable.id = tasks.idGroup
        JOIN taskuser ON taskuser.idTask = '${idTask}'
        JOIN discipline ON discipline.id = tasks.idDiscipline
        left JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        where tasks.id = '${idTask}'`,(err,resut)=>{
            let el = resut[0]
            resultObj.id = idTask
            resultObj.taskTitle = el.taskTitle
            resultObj.type = {
                typeId : el.typeID,
                typeTitle : el.typeTitle
            }
            resultObj.disciplineTitle = el.disciplineTitle
            resultObj.published = el.taskPublished
            resultObj.dateTo = el.taskDateTo
            resultObj.groupTitle = el.groupTitle
            resultObj.answerCount = el.answerCount
            resolve()
        })
    })

    await new Promise((resolve)=>{
        connection.query(`SELECT student.id as studentID, student.image as studentImage, student.fio as stidentFullname, taskusersanswer.dateAnswer as dateAnswer, taskuser.mark as taskMark  FROM tasks
        JOIN taskuser ON taskuser.idTask = tasks.id
        JOIN users as student ON student.id = taskuser.idUser
        left JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        where tasks.id = '${idTask}'`,(err,resut)=>{
            let arrayUser = []
            resut.forEach(el => {
                arrayUser.push({
                    id : el.studentID,
                    image : el.studentImage,
                    fullname : el.stidentFullname,
                    dateAnswer : el.dateAnswer,
                    mark : el.taskMark
                })
            })
            resultObj.studentAnswer = arrayUser
            resolve()
        })
    })

    res.send(resultObj)
})

module.exports = router