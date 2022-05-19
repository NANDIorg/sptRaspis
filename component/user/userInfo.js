const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const md5 = require('md5')

function index () {

    router.get('/api/getUserUrlId', async (req, res)=>{
        let resultObj = {
            id : 0,
            stats : [],
            info: {
                userImage: "",
                initials: "",
                course: 4,
                group: "",
                phrase: "",
                contacts: []
            },
            achievements : [],
            settings : {
                idUser: '',
                visible: 'teacher',
                notification: true,
                email: '',
                // changedPasswordAgo: 4
            }
        }
        const query = req.query.urlId

        if (!query) {
            res.sendStatus(422)
            return
        }

        let error = false
        let achievementsArray = []

        await new Promise((resolve)=>{
            connection.query(`
            SELECT users.id as idUser, users.fio as FIOUser, users.image as imageUser, users.wordsUser as phraseUser, 
            users.role as roleUser, users.vkId as vkUserLink, users.instagramId as instagramUserLink, users.tel as phoneUser, groupTable.name as groupName,
            YEAR(NOW()) - groupTable.yearStart as courseUser, users.urlId as urlIdUser, users.selectAll as visibleUser, users.mailSend as mailSendUser,
            users.email as emailUser, achievementsuser.id as achievementsuserID
            FROM users 
            JOIN groupTable ON groupTable.id = users.groupId
            left JOIN achievementsuser ON achievementsuser.idUser = users.id
            WHERE urlId = '${query}'`,(err, result)=>{
                if (err) {
                    error = true
                    resolve()
                    return
                } 
                if (result.length == 0) {
                    error = true
                    resolve()
                    return
                }
                resultObj.id = Number(result[0].idUser)
                resultObj.info.userImage = result[0].imageUser
                resultObj.info.initials = result[0].FIOUser
                resultObj.info.phrase = result[0].phraseUser
                resultObj.info.course = result[0].courseUser
                resultObj.info.group = result[0].groupName
                resultObj.info.contacts.push({id: 1, link: result[0].phoneUser, img: "TelephoneIcon", type: 'tel'})
                resultObj.info.contacts.push({id: 2, link: result[0].vkUserLink, img: "VkLogo", type: 'vk'})
                // resultObj.info.contacts.push({id: 3, link: result[0], img: InstagramLogo, type: 'inst'})
                resultObj.settings.idUser = result[0].urlIdUser
                resultObj.settings.visible = (result[0].visibleUser == 1) ? false : true 
                resultObj.settings.notification = (result[0].mailSendUser == 0) ? false : true 
                resultObj.settings.email = result[0].emailUser
                // resultObj.settings.changedPasswordAgo = result[0].groupName
                result.forEach(el => {
                    achievementsArray.push(el.achievementsuserID)
                });
                resolve()
            })
        })
        console.log(resultObj);

        for (let i = 0; i < achievementsArray.length; i++) {
            const el = achievementsArray[i];
            let userCount = 0
            let achievementsObj = {
                id : el
            }
            await new Promise((resolve)=>{
                connection.query(`SELECT * FROM achievements
                where achievements.id = '${el}'`,(err,result)=>{
                    if (err || result.length == 0) {
                        resolve()
                        return
                    }
                    achievementsObj.title = result[0].name
                    achievementsObj.description = result[0].description
                    resolve()
                })
            })
            await new Promise((resolve)=>{
                connection.query(`SELECT count(id) as userCount FROM users`,(err,result)=>{
                    if (err || result.length == 0) {
                        resolve()
                        return
                    }
                    userCount = result[0].userCount
                    resolve()
                })
            })
            await new Promise((resolve)=>{
                connection.query(`SELECT COUNT(id) as count FROM achievementsuser
                where achievementsuser.idAchievements = '${el}'`,(err,result)=>{
                    if (err || result.length == 0) {
                        resolve()
                        return
                    }
                    userAchievementsCount = result[0].count
                    resolve()
                })
            })
            achievementsObj.avg = ((userAchievementsCount / userCount) * 100).toFixed(0)
            resultObj.achievements.push(achievementsObj)
        }
        console.log(achievementsArray);
        res.status(200).send(resultObj)
    })

    router.get("/api/user/miniInfo", async (req, res) => {
        const token = md5(req.query.token)

        await new Promise((resolve)=>{
            connection.query(`SELECT users.image ,users.fio as fullname, case when users.role = 0 then grouptable.name  else null end as grouptableName, case when users.role = 0 then (year(NOW()) - grouptable.yearStart) else null end as course 
            FROM users
            left JOIN grouptable ON grouptable.id = users.groupId
            WHERE users.token = '${token}'`,(err,result)=>{
                res.send({
                    fullname : result[0].fullname,
                    group : result[0].grouptableName,
                    course : result[0].course,
                    image : result[0].image
                })
                resolve()
            })
        })
    })

    return router
}

module.exports = index