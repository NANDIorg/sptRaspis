const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')
const md5 = require('md5')

function index () {

    router.get('/api/getUserUrlId', (req, res)=>{
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
                idUser: 'nastenka',
                visible: 'teacher',
                notification: true,
                email: 'example@gmail.com',
                // changedPasswordAgo: 4
            }
        }
        const query = req.query.urlId
        connection.query(`
        SELECT \`users\`.\`id\` as idUser, \`users\`.\`fio\` as FIOUser, \`users\`.\`image\` as imageUser, \`users\`.\`wordsUser\` as phraseUser, 
        \`users\`.\`role\` as roleUser, \`users\`.\`vkId\` as vkUserLink, \`users\`.\`instagramId\` as instagramUserLink, \`users\`.\`tel\` as phoneUser, \`groupTable\`.\`name\` as groupName,
        YEAR(NOW()) - \`groupTable\`.\`yearStart\` as courseUser, \`users\`.\`urlId\` as urlIdUser, \`users\`.\`selectAll\` as visibleUser, \`users\`.\`mailSend\` as mailSendUser,
        \`users\`.\`email\` as emailUser
        FROM users 
        JOIN groupTable ON \`groupTable\`.\`id\` = \`users\`.\`groupId\`
        WHERE urlId = '${query}'`,(err, result)=>{
            if (err) return 
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
    
            res.status(200).send(resultObj)
        })
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