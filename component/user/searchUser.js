const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

function index () {

    router.get("/api/user/getAll", async (req, res) => {
        let arrResult = []
        // await new Promise((resolve) => {
        //     connection.query("")
        //     resolve()
        // })
        await new Promise((resolve) => {
            connection.query(`SELECT users.id, users.image, users.fio, users.role, grouptable.name as groupName, year(NOW()) - grouptable.yearStart as course, users.wordsUser, users.urlId, users.online FROM users
            LEFT JOIN grouptable ON grouptable.id = users.groupId
            WHERE users.role != 2`, (err, result) => {
                console.log(result)
                result.forEach(el => {
                    arrResult.push({
                        id: el.id,
                        img : el.image,
                        fullname: el.fio,
                        isTeacher: (el.role == 1) ? true : false,
                        group : el.groupName,
                        course: el.course,
                        quote: el.wordsUser,
                        idUser: el.urlId,
                        isOnline : (el.online == 1) ? true : false
                    })
                });
                resolve()
            })
        })
        res.send(arrResult)
    })

    return router
}

module.exports = index