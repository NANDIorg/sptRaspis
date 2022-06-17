const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')
const multer  = require("multer");
const clients = require("../../websocket/client")

router.post("/api/sendMessage", async (req,res)=>{
    const body = req.body
    const token = (req.headers.token) ? md5(req.headers.token) : null
    const messageText = body.message
    const idDialog = body.idDialog
    
    if (!token || !messageText || !idDialog) {
        res.status(422).send("data invalid")
        return
    }

    let error = false

    await new Promise ((resolve)=>{
        let date = new Date()
        connection.query(`INSERT INTO dialoginfo 
        (idDialog, idUser, textMessage, dateMessage) 
        VALUES 
        (@idDialog, (select id from users where token = @token), @message, @date)`,{
            token : token,
            idDialog : idDialog,
            message : messageText,
            date : `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        }, (err, result) => {
            resolve()
            if (err) {
                res.status(502).send("message invalid")
                error = true
            }
        })
    })

    if (error) {
        return
    }

    let imageDialog, nameDialog, fioAuthor

    await new Promise((resolve)=>{
        resolve()
        try {
            connection.query(`SELECT (CASE dialog.isPersonal when 1 then users.image else dialog.image end) as imageDialog,
            case dialog.isPersonal
                WHEN 1 THEN users.fio
                else dialog.name
            END as nameDialog, users.fio as fioAuthorMessage
            FROM dialog
            JOIN users ON users.token = @token
            WHERE dialog.id = @idDialog`,{
                token : token,
                idDialog : idDialog,
            },(err,result)=>{
                if (err || !result) {
                    res.status(502).send("message invalid")
                    error = true
                    return
                }
                imageDialog = result[0].imageDialog
                nameDialog = result[0].nameDialog
                fioAuthor = result[0].fioAuthorMessage
            })
        } catch (e) {
            console.log(e);
            res.status(502).send("message invalid")
            return
        }
    })

    if (error) {
        return
    }

    await new Promise((resolve)=>{
        connection.query(`select users.token from dialogusers
        join users ON users.id = dialogusers.idUser
        where dialogusers.idDialog = @idDialog`,{
            token : token,
            idDialog : idDialog
        }, (err,result)=>{
            resolve()
            if (err || !result) {
                error = true
                res.status(502).send("message invalid")
                return
            }
            for (let i = 0; i < result.length; i++) {
                const el = result[i].token
                let keysClient = [...clients.keys()]
                keysClient.forEach((client) => {
                    const metadata = clients.get(client)
                    if (!metadata.token) {

                    } else if (md5(metadata.token) == token) {
                        client.send(JSON.stringify({
                            type : "sendMessage",
                            message : messageText,
                            idDialog : idDialog,
                            isYou : true,
                            imageDialog : imageDialog,
                            nameDialog : nameDialog,
                            fioAuthorMessage : fioAuthor
                        }))
                    } else if (metadata.token == el) {
                        client.send(JSON.stringify({
                            type : "sendMessage",
                            message : messageText,
                            idDialog : idDialog,
                            imageDialog : imageDialog,
                            nameDialog : nameDialog,
                            isYou : false,
                            fioAuthorMessage : fioAuthor
                        }))
                    }
                });
            }
        })
    })

    if (error) {
        return
    }

    res.sendStatus(200)
})

module.exports = router