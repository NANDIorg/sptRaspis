const multer  = require("multer");
const router = require('express').Router()
const createName = require("./createNameFile")
const md5 = require('md5')
const connection = require('../../lib/connetion')

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "assets/tasksFile/")
    },
    filename: (req, file, cb) =>{
        let fileName =  `${Date.now()}${createName()}.${file.mimetype.split('/')[1]}`
        cb(null, fileName);
    }
});

const upload = multer({ storage: storageConfig })

router.get("/api/teacher/getTypeTask", async (req,res)=>{
    await new Promise((resolve)=>{
        connection.query(`SELECT * FROM typetask`,(err,result)=>{
            res.send(result)
            resolve()
        })
    })
})

router.get("/api/teacher/getGroupDiscipline", async (req,res)=>{
    const query = req.query

    const idDisc = query.id


    if (!idDisc) {
        res.status(403).send("id invalid")
        return
    }

    await new Promise((resolve) => {
        connection.query(`SELECT grouptable.name as title, grouptable.id as id FROM disciplinestudent 
        JOIN grouptable ON grouptable.id = disciplinestudent.idGroup
        WHERE disciplinestudent.idDiscipline = '${idDisc}'`, (err,result)=>{
            res.send(result)
            resolve()
        })
    })
})

router.get("/api/teacher/getDisciplineTask", async (req, res) => {
    const query = req.query

    const token = query.token

    if (!token) {
        res.sendStatus(403)
        return
    }

    await new Promise((resolve) => {
        connection.query(`SELECT discipline.name as title, discipline.id as id, typediscipline.id as idType, typediscipline.title as typeTitle FROM users 
        JOIN disciplineteacher ON disciplineteacher.idTeacher = users.id
        JOIN discipline ON discipline.id = disciplineteacher.idDiscipline
        JOIN typediscipline ON typediscipline.id = discipline.type
        where users.token = '${md5(token)}'`, (err,result)=>{
            res.send(result)
            resolve()
        })
    })
})

router.post("/api/teacher/createTask", upload.fields([{name : 'files'}]) , async (req,res)=>{
    // const token = 
    const body = req.body

    const nameTask = body.title // Название задания
    const descriptionTask = body.description // описание задания
    const dateFrom = body.dateFrom // начало задания
    const dateTo = body.dateTo // конец задания
    const disciplineTask = body.discipline // дисциплина задания
    const groupTask = body.group // группа задания
    const typeTask = body.type // тип задания
    const filesTask = req.files.files // файлы задания
    const tokenTeacher = body.token // Токен учителя

    if (!nameTask || !descriptionTask || !dateFrom || !dateTo || !disciplineTask || !groupTask || !typeTask || !tokenTeacher) {
        res.sendStatus(403)
        return
    }

    let filesId = []
    let taskId = 0
    let usersGroup = []
    let idTeacher = 0

    await new Promise((resolve)=>{
        connection.query(`SELECT id FROM users WHERE token = '${md5(tokenTeacher)}'`,(err,result)=>{
            idTeacher = result[0].id
            resolve()
        })
    })

    for (let i = 0; i < filesTask.length; i++) {
        const el = filesTask[i];
        await new Promise((resolve)=>{
            connection.query(`INSERT INTO image (name, originalName) VALUES ('${el.filename}', '${el.originalname}')`,(err,result)=>{
                filesId.push(result.insertId)
                resolve()
            })
        })
    }
    await new Promise ((resolve)=>{
        connection.query(`INSERT INTO tasks  (name, type, idDiscipline, start, end, description, idFiles, idUserCreated, idGroup) VALUES ('${nameTask}', '${typeTask}', '${disciplineTask}', '${dateFrom}', '${dateTo}', '${descriptionTask}', '${filesId.join(',')}', '${idTeacher}', '${groupTask}')`,(err,result)=>{
            taskId = result.insertId
            resolve()
        })
    })

    await new Promise((resolve)=>{
        connection.query(`SELECT id FROM users WHERE groupId = '${groupTask}';`,(err,result)=>{
            result.forEach(el => {
                usersGroup.push(el.id)
            });
            resolve()
        })
    })

    for (let i = 0; i < usersGroup.length; i++) {
        const el = usersGroup[i];
        await new Promise((resolve)=>{
            connection.query(`INSERT INTO taskuser (idTask, idUser) VALUES ('${taskId}', '${el}')`,(err,result)=>{
                resolve()
            })
        })
    }

    res.sendStatus(200)
})

module.exports = router