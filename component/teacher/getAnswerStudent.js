const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get("/api/teacher/getAnswerStudent", async (req,res)=>{
    const idTask = req.query.idTask
    const idUser = req.query.idUser

    if (!idTask || !idUser) {
        res.sendStatus(422)
        return
    }

    let error = false
    let resultObj = {}
    let fileId = []

    await new Promise ((resolve)=>{
        connection.query(`SELECT typetask.title as typeTaskTitle, typetask.id as typeTaskId, tasks.start as published, discipline.name as disciplineTitle, discipline.id as disciplineId,
        typediscipline.title as typeDisciplineTitle, typediscipline.id as typeDisciplinId,
        taskusersanswer.dateAnswer as dateAnswer, taskusersanswer.fileId as fileAnswer, taskusersanswer.text as answerText, taskuser.mark as markStudent,
        student.fio as fullname, student.image as imageStudent, student.urlId as urlStudent
        FROM tasks
        JOIN typetask ON typetask.id = tasks.type
        JOIN discipline ON discipline.id = tasks.idDiscipline
        JOIN users as student ON student.id = '${idUser}'
        JOIN typediscipline ON typediscipline.id = discipline.type
        JOIN taskuser ON taskuser.idUser = student.id and taskuser.idTask = tasks.id
        left JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        WHERE tasks.id = '${idTask}'`, (err,result)=>{
            if (err) {
                error = true
                resolve()
                return
            }
            if (result.length == 0) {
                error = true
                resolve()
                return
            }
            const el = result[0]
            resultObj.discipline = {
                id : el.disciplineId,
                name : el.disciplineTitle,
                type : el.typeDisciplinId,
            }
            resultObj.taskType = {
                type : el.typeTaskId,
                name : el.typeTaskTitle
            }
            resultObj.published = el.published
            resultObj.author = {
                id : el.urlStudent,
                fullname : el.fullname,
                image : el.imageStudent,
            }
            resultObj.dateTo = el.dateAnswer
            resultObj.mark = el.markStudent
            resultObj.reply = {
                description : el.answerText,
                files : []
            }
            if (el.fileAnswer != null) {
                fileId = el.fileAnswer.split(',')
            } else {
                fileId = []
            }
            
            resolve()
        })
    })

    if (error) {
        res.sendStatus(422)
        return
    }

    for (let i = 0; i < fileId.length; i++) {
        const el = fileId[i];
        await new Promise((resolve)=>{
            connection.query(`SELECT * FROM image WHERE id = '${el}'`,(err,result)=>{
                resultObj.reply.files.push({
                    id : result[0].id,
                    src : `tasksFile/${result[0].name}`,
                    originalName : result[0].originalName
                })
                resolve()
            })
        })
    }

    res.send(resultObj)
})

module.exports = router