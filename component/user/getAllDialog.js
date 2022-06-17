const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/user/getAllDialog",async (req,res)=>{
    const token = (req.headers.token) ? md5(req.headers.token) : null
    if (!token) {
        res.status(422).send("token Invalid")
        return
    }
    await new Promise((resolve)=>{
        connection.query(`SELECT dialogusers.idDialog as idDialog, dialog.isPersonal, dialoginfo.textMessage, dialoginfo.dateMessage, 
        case dialog.isPersonal
            WHEN 1 THEN (
                select caseJoinUsers.fio from dialogusers as caseDialogUser
                JOIN users as caseJoinUsers ON caseJoinUsers.id = caseDialogUser.idUser
                where caseDialogUser.idDialog = dialogusers.idDialog and caseDialogUser.idUser <> (SELECT id FROM users WHERE token = @token)
                limit 1
            )
            else dialog.name
        END as nameDialog,
        case dialog.isPersonal
            WHEN 1 THEN (
                SELECT selectUsers.image FROM dialogusers as selectdialogusers
                JOIN users as selectUsers ON selectUsers.id = selectdialogusers.idUser
                WHERE selectdialogusers.id = dialogusers.idDialog and selectdialogusers.idUser <> (SELECT id FROM users WHERE token = @token)
            )
            else dialog.image
        END as image,
        CASE dialoginfo.idUser  
             WHEN (SELECT id FROM users WHERE token = @token) THEN 1 
             ELSE 0
        END as isYou,
        users.fio as messageAuthorName,
        users.image as messageAuthorImage
        FROM dialogusers
        JOIN dialog ON dialog.id = dialogusers.idDialog
        left join dialoginfo on dialoginfo.idDialog = dialogusers.idDialog
        left JOIN users ON users.id = dialoginfo.idUser
        WHERE dialogusers.idUser = (SELECT id FROM users WHERE token = @token)
        group by dialogusers.idDialog
        ORDER BY dialoginfo.dateMessage DESC`,{
            token : token
        },(err,result)=>{
            if (err) {
                console.error(err);
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            res.send(result)
            resolve()
        })
    })
})

module.exports = router