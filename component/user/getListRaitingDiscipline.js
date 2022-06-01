const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get(`/api/student/getListRaitingDiscipline`, async (req,res)=>{
    const idDiscipline = req.query.idDiscipline
    const token = (!!req.headers.token) ? md5(req.headers.token) : undefined

    if (!token || !idDiscipline) {
        res.sendStatus(422)
        return
    }

    let idUserYou = 0
    let error = false
    let resultObj = {
        id : 0,
        title : "",
        youPlace : 0,
        usersTop : []
    }

    await new Promise((resolve)=>{
        connection.query(`select id from user where token = '${token}'`,(err,result)=>{
            if (err) {
                error = true
                console.log(err)
                resolve()
                return
            }
            if (result.length == 0) {
                error = true
                console.log(err)
                resolve()
                return
            }
            idUserYou = result[0].id
            resolve()
        })
    })

    if (error) {
        res.sendStatus(422)
        return
    }

    await new Promise((resolve)=>{
        connection.query(`
        SELECT users.id,users.image,( avg(taskuser.mark) * (count(taskuser.mark)/count(tasks.id)*100)) as top, grouptable.name as groupName, avg(taskuser.mark) as avgMark, count(taskuser.mark) as compliteTask, users.fio,(SELECT name FROM discipline Where id = @idDiscipline) as disciplineName
        FROM users
        JOIN disciplinestudent ON disciplinestudent.idGroup = users.groupId and disciplinestudent.idDiscipline = @idDiscipline
        join grouptable ON grouptable.id = users.groupId
        join tasks ON tasks.idDiscipline = @idDiscipline
        join taskuser ON taskuser.idUser = users.id and taskuser.idTask = tasks.id
        group by users.id
        order by top desc`,{idDiscipline : idDiscipline},(err,result)=>{
            if (err) {
                error = true
                console.log(err)
                resolve()
                return
            }
            if (result.length == 0) {
                error = true
                console.log(err)
                resolve()
                return
            }
            resultObj.title = result[0].disciplineName
            for (let i = 0; i < result.length; i++) {
                const el = result[i];
                if (el.id == idUserYou) {
                    resultObj.youPlace = i + 1
                }
                resultObj.usersTop.push({
                    id : i,
                    fullname : el.fio,
                    groupName : el.groupName,
                    avgMark : el.avgMark,
                    image : el.image,
                    compliteTask : el.compliteTask,
                    isYou : (el.id == idUserYou) ? true : false
                })
            }
            resolve()
        })
    })

    if (error) {
        res.sendStatus(422)
        return
    }

    res.send(resultObj)
    
})

module.exports = router