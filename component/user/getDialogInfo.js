const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/users/dialogInfo", async (req,res)=>{
    const idDialog = req.query.idDialog
    const token = (req.headers.token) ? md5(req.headers.token) : null

    let resultObj = {
        messages : []
    }

    if (!token || !idDialog) {
        res.status(422).send("data invalid")
        return
    }

    let error = false

    await new Promise((resolve) => {
        connection.query(`SELECT dialog.id, 
        case dialog.isPersonal
            when 1 then (
                select caseJoinUsers.image from dialogusers as caseDialogUser
                JOIN users as caseJoinUsers ON caseJoinUsers.id = caseDialogUser.idUser
                where caseDialogUser.idDialog = @idDialog and caseDialogUser.idUser <> (SELECT id FROM users WHERE token = @token)
                limit 1
            )
            else dialog.image
        end as imageDialog,
        case dialog.isPersonal
            WHEN 1 THEN (
                select caseJoinUsers.fio from dialogusers as caseDialogUser
                JOIN users as caseJoinUsers ON caseJoinUsers.id = caseDialogUser.idUser
                where caseDialogUser.idDialog = @idDialog and caseDialogUser.idUser <> (SELECT id FROM users WHERE token = @token)
                limit 1
            )
            else dialog.name
        END as nameDialog
        FROM dialog
        JOIN dialogusers ON dialogusers.idUser = (SELECT id FROM users WHERE token = @token) and dialogusers.idDialog = dialog.id
        WHERE dialog.id = @idDialog`,{
            idDialog : idDialog,
            token : token
        },(err,result)=>{
            if (err) {
                error = true
                console.error(err);
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            if (!result) {
                error = true
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            resultObj.nameDialog = result[0].nameDialog
            resultObj.imageDialog = result[0].imageDialog
            resultObj.id = result[0].id
            resolve()
        })
    })

    if (error) {
        return
    }

    await new Promise((resolve)=>{
        connection.query(`SELECT dialoginfo.id, DATE_FORMAT(dialoginfo.dateMessage, "%d.%m.%Y") as dateMessage, DATE_FORMAT(dialoginfo.dateMessage, "%H:%i") as timeMessage, users.fio as authorFIO, users.image as authorImage,
        CASE dialoginfo.idUser
            WHEN (SELECT id FROM users WHERE token = @token) THEN 1
            else 0
        END as isYou,
        dialoginfo.textMessage
        FROM dialoginfo
        LEFT JOIN users ON users.id = dialoginfo.idUser
        WHERE dialoginfo.idDialog = @idDialog
        ORDER BY dialoginfo.dateMessage`,{
            idDialog : idDialog,
            token : token
        },(err,result)=>{
            if (err) {
                error = true
                console.error(err);
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            if (!result) {
                error = true
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            result.forEach(el => {
                resultObj.messages.push({
                    id : el.id,
                    date : el.dateMessage,
                    time : el.timeMessage,
                    isYou : el.isYou,
                    textMessage : el.textMessage,
                    author : {
                        fio : el.authorFIO,
                        image : el.authorImage
                    }
                })
            })
            resolve()
        })
    })

    if (error) {
        return
    }

    res.send(resultObj)
})

module.exports = router