const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')
const createNameFile = require('../../lib/createNameFile')
const multer  = require("multer");
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "assets/tasksFile/")
    },
    filename: (req, file, cb) =>{
        let fileName =  `${Date.now()}${createNameFile()}.${file.mimetype.split('/')[1]}`
        console.log(fileName);
        cb(null, fileName);
    }
})
const upload = multer({ storage: storageConfig })

router.post("/api/student/postAnswer", upload.fields([{name : 'files'}]), async (req,res) =>{
    const token = md5(req.body.token)
    const textAnswer = req.body.reply
    const idTask = req.body.idTask
    const files = req.files.files

    if (!token || !textAnswer) {
        res.sendStatus(403)
        return
    }

    let idStudent = 0
    let filesId = []

    await new Promise((resolve)=>{
        connection.query(`SELECT taskuser.id FROM taskuser 
        JOIN users ON users.token = '${token}'
        WHERE taskuser.idUser = users.id and taskuser.idTask = '${idTask}'`,(err,result)=>{
            idTaskStudent = result[0].id
            resolve()
        })
    })

    for (let i = 0; i < files.length; i++) {
        const el = files[i];
        await new Promise ((resolve)=>{
            connection.query(`INSERT INTO image (name, originalName) VALUES ('${el.filename}', '${el.originalname}')`,(err,result)=>{
                filesId.push(result.insertId)
                resolve()
            })
        })
    }

    await new Promise ((resolve)=>{
        connection.query(`INSERT INTO taskusersanswer (idTaskUser, fileId, text) VALUES ('${idTaskStudent}', '${filesId.join(',')}', '${textAnswer}')`,(err,result)=>{
            filesId.push(result.insertId)
            resolve()
        })
    })
    
    res.sendStatus(200)
})

module.exports = router