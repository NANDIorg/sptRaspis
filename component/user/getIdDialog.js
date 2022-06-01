const router = require('express').Router()
const md5 = require('md5')
const connection = require('../../lib/connetion')

router.get("/api/getIdDialog", async (req,res)=>{
    const token = md5(req.body.req)
    const urlIDUsers = req.body.urlIdUser
    if (!token || !urlIDUsers) {
        res.status(422).send("data invalid")
        return
    }
    await new Promise((resolve)=>{
        connection.query(`SELECT oneD.idDialog as idDialog FROM dialogusers as oneD
        JOIN dialogusers as twoD ON twoD.idDialog = oneD.idDialog and twoD.idUser = (SELECT id FROM users WHERE urlId = "${urlIDUsers}")
        JOIN dialog ON dialog.id = oneD.idDialog and dialog.isPersonal
        WHERE oneD.idUser = (SELECT id FROM users WHERE token = "${token}")`,(err,result)=>{
            if (err) {
                console.error(err);
                res.status(422).send("chtoto invalid")
                resolve()
                return
            }
            if (result.length == 0) {
                console.error(err);
                resolve()
                return
            }
            res.send(result[0].idDialog)
            resolve()
        })
    })

})

module.exports = router