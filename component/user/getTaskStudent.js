const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/student/getTaskStudent", async (req, res) => {
    const token = req.query.token
    const idDiscipline = req.query.idDiscipline

    // console.log(idDiscipline, token);

    if (token == undefined || idDiscipline == undefined) {
        res.sendStatus(403)
        return
    }

    let resultArray = []
    await new Promise ((resolve) => {
        connection.query(`SELECT tasks.id as id, tasks.name as title, tasks.type as type, tasks.description, tasks.start as published, tasks.end as dateTo, taskuser.mark as mark, taskusersanswer.id as answer, teacher.fio as teacherFIO, teacher.urlId as idTeacher, teacher.image as teacherImage  FROM users
        JOIN taskuser ON users.id = taskuser.idUser
        JOIN tasks ON tasks.id = taskuser.idTask and tasks.idDiscipline = '${idDiscipline}'
        left JOIN users as teacher ON teacher.id = tasks.idUserCreated
        left JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        WHERE users.token = '${md5(token)}'`, (err, result) => {    
            for (let i = 0; i < result.length; i++) {
                const el = result[i];
                // console.log(el.published, Date.now(), el.published > Date.now());
                if (el.published > Date.now()) continue
                resultArray.push({
                    id : el.id,
                    title : el.title,
                    description : el.description,
                    type : el.type,
                    answer : (el.answer) ? true : false,
                    published : el.published,
                    dateTo : el.dateTo,
                    author : {
                        id : el.idTeacher,
                        fullname : el.teacherFIO,
                        image : el.teacherImage
                    },
                    mark : el.mark
                })
            }
            res.send(resultArray)
            resolve()
        })
    })
})

router.get("/api/task/getMainInfo", async (req,res)=>{
    const token = md5(req.query.token)
    const idTask = req.query.idTask
    
    if (token == undefined || idTask == undefined) {
        res.sendStatus(403)
        return
    }

    let resultBdMain = {}
    let arrayTaskFile = []
    let arrayAnswerFile = []

    await new Promise((resolve)=>{
        connection.query(`SELECT tasks.id as taskId, tasks.name as taskName, tasks.description, tasks.idFiles, tasks.start, tasks.end, typetask.title as typeTaskName, typetask.id as typeTaskId,
        discipline.name as disciplineName ,discipline.type as disciplineType, typediscipline.title as disciplineTypeName, 
        author.fio as authorFullname, author.urlId as authUrlId, author.image as authorImage, 
        taskuser.mark, taskusersanswer.id as answerId, taskusersanswer.text as answerText, taskusersanswer.fileId
        FROM tasks 
        JOIN discipline ON discipline.id = tasks.idDiscipline 
        JOIN typediscipline ON typediscipline.id = discipline.type 
        JOIN typetask ON typetask.id = tasks.type 
        JOIN users as author ON author.id = tasks.idUserCreated
        JOIN users as student ON student.token = '${token}'
        JOIN taskuser ON taskuser.idTask = tasks.id and taskuser.idUser = student.id
        LEFT JOIN taskusersanswer ON taskusersanswer.idTaskUser = taskuser.id
        where tasks.id = '${idTask}'
        `, (err,result)=>{
            resultBdMain = result[0]
            resolve()
        })
    })
    for (let i = 0; i < resultBdMain.idFiles.split(',').length; i++) {
        const el = resultBdMain.idFiles.split(',')[i];
        await new Promise((resolve)=>{
            connection.query(`SELECT * FROM image
            where id = '${el}'`, (err,result)=>{
                arrayTaskFile.push({
                    id : el,
                    file : `tasksFile/${result[0].name}`,
                    name : result[0].originalName
                })
                resolve()
            })
        })
    }

    if (resultBdMain.fileId != null) {
        for (let i = 0; i < resultBdMain.fileId.split(',').length; i++) {
            const el = resultBdMain.fileId.split(',')[i];
            await new Promise((resolve)=>{
                connection.query(`SELECT * FROM image
                where id = '${el}'`, (err,result)=>{
                    arrayAnswerFile.push({
                        id : el,
                        file : `tasksFile/${result[0].name}`,
                        name : result[0].originalName
                    })
                    resolve()
                })
            })
        }
    }
    
    res.status(200).send({
        id : resultBdMain.taskId,
        title : resultBdMain.taskName,
        description : resultBdMain.description,
        files : arrayTaskFile,
        discipline : {
            name : resultBdMain.disciplineName,
            type : resultBdMain.disciplineType,
            typeName : resultBdMain.disciplineTypeName
        },
        taskType : {
            name : resultBdMain.typeTaskName,
            type : resultBdMain.typeTaskId
        },
        published : resultBdMain.start,
        dateTo : resultBdMain.end,
        author : {
            id : resultBdMain.authUrlId,
            fullname : resultBdMain.authorFullname,
            image : resultBdMain.authorImage
        },
        reply : {
            isBe : (resultBdMain.answerId != null) ? true : false ,
            description : resultBdMain.answerText,
            files : arrayAnswerFile
        },
        mark : resultBdMain.mark
    })
})

router.get("/api/student/getDisciplineTask", async (req, res)=>{
    const token = md5(req.query.token)

    if (token == undefined) {
        res.sendStatus(403)
        return
    }

    let arrauResult = []

    await new Promise((resolve)=>{
        connection.query(`SELECT discipline.id as idDiscipline, discipline.name as titleDiscipline, discipline.type as typeIdDiscipline, typediscipline.title as typeNameDiscipline FROM users
        JOIN disciplinestudent ON disciplinestudent.idGroup = users.groupId
        JOIN discipline ON discipline.id = disciplinestudent.idDiscipline
        JOIN typediscipline ON typediscipline.id = discipline.type
        where users.token = '${token}'`,(err, result)=>{
            if (result.length == 0) {
                res.sendStatus(403)
            } else {
                for (let i = 0; i < result.length; i++) {
                    const el = result[i];
                    arrauResult.push({
                        id : el.idDiscipline,
                        title : el.titleDiscipline,
                        idType : el.typeIdDiscipline,
                        typeName : el.typeNameDiscipline
                    })
                }
                
            }
            resolve()
        })
    })
    if (arrauResult.length == 0) return
    res.send(arrauResult)
})

module.exports = router