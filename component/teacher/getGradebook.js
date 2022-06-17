const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/teacher/getGradebook", async (req,res)=>{
    const token = (req.headers.token) ? md5(req.headers.token) : null
    const idDiscipline = req.query.idDiscipline
    const idGroup = req.query.idGroup
    const month = req.query.month

    if (!token, !idDiscipline) {
        res.status(422).send({
            error : ['data']
        })
        return
    }

    let queryFilterGroup = `left JOIN taskuser ON taskuser.idTask = tasks.id JOIN users as usersFilter ON usersFilter.id = taskuser.idUser`
    let selectFilterGroup = `taskuser.idUser, taskuser.mark, taskuser.id,`
    let filterMonth = ``

    if (idGroup) {
        queryFilterGroup = `left JOIN taskuser ON taskuser.idTask = tasks.id JOIN users as usersFilter ON usersFilter.id = taskuser.idUser and usersFilter.groupId = @idGroup`

        selectFilterGroup = `taskuser.idUser, taskuser.mark,`
    }

    await new Promise((resolve)=>{
        connection.query(`SELECT ${selectFilterGroup} tasks.id, tasks.name as taskTitle, tasks.start as taskDate FROM tasks ${queryFilterGroup} WHERE tasks.idDiscipline = @idDiscipline`,{
            idDiscipline : idDiscipline,
            idGroup : idGroup,
            month : month
        },(err,result)=>{
            let resultObj = {}
            for (let i = 0; i < result.length; i++) {
                const el = result[i];
                if (!resultObj[el.idUser]) {
                    resultObj[el.idUser] = {}
                    resultObj[el.idUser].tasks = []
                    resultObj[el.idUser].idUser = el.idUser
                }
                resultObj[el.idUser].tasks.push({
                    title : el.taskTitle,
                    date : el.taskDate,
                    markUser : el.mark
                })
            }
            res.send(resultObj)
            resolve()
        })
    })
})

module.exports = router