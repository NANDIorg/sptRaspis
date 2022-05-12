const router = require('express').Router()
const connection = require('./connetion')
const createNameFile = require('./createNameFile')
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

router.post("/api/loadFileTask", upload.fields([{name : 'files'}]),async (req,res)=>{
    const files = req.files.files
    let filesId = []
    console.log(files);

    for (let i = 0; i < files.length; i++) {
        const el = files[i];
        await new Promise ((resolve)=>{
            connection.query(`INSERT INTO image (name, originalName) VALUES ('${el.filename}', '${el.originalname}')`,(err,result)=>{
                filesId.push({
                    id : result.insertId,
                    title : el.filename,
                    src : `tasksFile/${el.filename}`
                })
                resolve()
            })
        })
    }

    res.send(filesId)
})

module.exports = router