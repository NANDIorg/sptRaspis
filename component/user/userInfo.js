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
                contacts: []
            },
            achievements : [],
            settings : {}
        }
        const query = req.query.urlId
        
        const token = (!!req.headers.token) ? md5(req.headers.token) : undefined

        if (!query || !token) {
            res.sendStatus(422)
            return
        }

        let error = false
        let achievementsArray = []
        let userRole = 0
        let idUserReq = 0

        await new Promise((resolve)=>{
            connection.query(`SELECT id FROM users WHERE token = '${token}'`,(err,result)=>{
                if (err) {
                    error = true
                    console.error(err);
                    resolve()
                    return
                }
                if (result.length == 0) {
                    error = true
                    console.error("Такого пользователя не существует")
                    resolve()
                    return
                }
                idUserReq = result[0].id
                resolve()
            })
        })

        if (error) {
            res.sendStatus(422)
            return
        }

        await new Promise((resolve)=>{
            connection.query(`SELECT role FROM users WHERE urlId = '${query}'`,(err,result)=>{
                if (err) {
                    error = true
                    console.error(err);
                    resolve()
                    return
                }
                if (result.length == 0) {
                    error = true
                    console.error("Такого пользователя не существует")
                    resolve()
                    return
                }
                userRole = result[0].role
                resolve()
            })
        })

        if (error) {
            res.sendStatus(422)
            return
        }

        switch (userRole) {
            case 0 :
                await new Promise((resolve)=>{
                    connection.query(`
                    SELECT users.lastUpdatePasword as lastUpdatePasword, users.id as idUser, users.fio as FIOUser, users.image as imageUser, users.wordsUser as phraseUser, 
                    users.role as roleUser, users.vkId as vkUserLink, users.instagramId as instagramUserLink, users.tel as phoneUser, groupTable.name as groupName,
                    YEAR(NOW()) - groupTable.yearStart as courseUser, users.urlId as urlIdUser, users.selectAll as visibleUser,
                    users.email as emailUser, GROUP_CONCAT(achievementsuser.id) as achievementsuserID
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
                        resultObj.isYou = (Number(idUserReq) == Number(result[0].idUser)) ? true : false
                        resultObj.info.role = userRole
                        resultObj.info.userImage = result[0].imageUser
                        resultObj.info.initials = result[0].FIOUser
                        resultObj.info.phrase = result[0].phraseUser
                        resultObj.info.course = result[0].courseUser
                        resultObj.info.group = result[0].groupName
                        if (result[0].phoneUser) {
                            resultObj.info.contacts.push({id: 1, link: result[0].phoneUser, img: "TelephoneIcon", type: 'tel'})
                        }
                        if (result[0].vkUserLink) {
                            resultObj.info.contacts.push({id: 2, link: result[0].vkUserLink, img: "VkLogo", type: 'vk'})
                        }
                        // resultObj.info.contacts.push({id: 3, link: result[0], img: InstagramLogo, type: 'inst'})
                        resultObj.settings.idUser = result[0].urlIdUser
                        resultObj.settings.visible = (result[0].visibleUser == 1) ? false : true 
                        // resultObj.settings.notification = (result[0].mailSendUser == 0) ? false : true 
                        resultObj.settings.email = result[0].emailUser
                        resultObj.settings.changedPasswordAgo = ((Date.now() - result[0].lastUpdatePasword)/(1000 * 60 * 60 * 24)).toFixed(0)
                        if (result[0].achievementsuserID !== null) {
                            result[0].achievementsuserID.split(",").forEach(el => {
                                achievementsArray.push(el)
                            });
                        } 
                        resolve()
                    })
                })

                await new Promise((resolve) => {
                    connection.query(`SELECT AVG(taskuser.mark) as avgMark
                    FROM users 
                    join tasks on YEAR(NOW()) = year(tasks.start) and
                    (
                    case 
                        when month(tasks.start) < 7 THEN 1
                        when month(tasks.start) > 7 THEN 1
                    end
                    )  = (
                    case 
                        when month(NOW()) < 7 THEN 1
                        when month(NOW()) > 7 THEN 1
                    end
                    )
                    join taskuser on taskuser.idUser = users.id and taskuser.idTask = tasks.id
                    WHERE urlId = '${query}'`,(err,result)=>{
                        if (err) {
                            error = true
                            resolve()
                            return
                        } 
                        if (result.length == 0) {
                            resultObj.stats.push({
                                id : 1,
                                title : "Средняя оценка за семестр",
                                value : 0,
                                name : "avg_mark"
                            })
                            resolve()
                            return
                        }
                        resultObj.stats.push({
                            id : 1,
                            title : "Средняя оценка за семестр",
                            value : result[0].avgMark,
                            name : "avg_mark"
                        })
                        resolve()
                    })
                })

                await new Promise((resolve) => {
                    connection.query(`SELECT student.id, student.fio, ( case when AVG(taskuser.mark) is not null THEN AVG(taskuser.mark) else 0 end) as avgMark, student.urlId
                    FROM users
                    JOIN grouptable on grouptable.id = users.groupId
                    JOIN users as student ON student.groupId = grouptable.id
                    left JOIN taskuser ON taskuser.idUser = student.id
                    WHERE users.urlId = "${query}"
                    group by student.id
                    order by AVG(taskuser.mark) DESC`,(err,result)=>{
                        if (err) {
                            error = true
                            resolve()
                            return
                        } 
                        for (let i = 0; i < result.length; i++) {
                            const el = result[i];
                            if (el.urlId === query) {
                                resultObj.stats.push({
                                    id : 2,
                                    title : "Место по рейтингу в группе",
                                    name : "group_place",
                                    value : i + 1
                                })
                                break
                            }
                        }
                        resolve()
                    })
                })

                await new Promise((resolve)=>{
                    connection.query(`SELECT (SELECT COUNT(achievements.id) FROM achievements) as countAllAchievements, count(achievementsuser.id) as countYouAchievements
                    FROM users 
                    JOIN achievementsuser ON achievementsuser.idUser = users.id
                    WHERE users.urlId = "${query}"`,(err,result)=>{
                        if (err) {
                            error = true
                            resolve()
                            return
                        }
                        resultObj.stats.push({
                            id : 3,
                            title : "Количество полученных достижений",
                            name : "achievements",
                            value : [result[0].countYouAchievements,result[0].countAllAchievements]
                        })
                        resolve()
                    })
                })

                await new Promise((resolve)=>{
                    connection.query(`SELECT count(taskuser.id) as count FROM users
                    JOIN taskuser ON taskuser.idUser = users.id and taskuser.mark is not null
                    WHERE users.urlId = "${query}"`,(err,result)=>{
                        if (err) {
                            error = true
                            resolve()
                            return
                        }
                        resultObj.stats.push({
                            id : 4,
                            title : "Количество выполненных заданий",
                            name : "completed_tasks",
                            value : result[0].count
                        })
                        resolve()
                    })
                })

                break
            case 1 :
                await new Promise((resolve)=>{
                    connection.query(`
                    SELECT users.lastUpdatePasword as lastUpdatePasword, users.id as idUser, users.fio as FIOUser, users.image as imageUser, users.wordsUser as phraseUser, 
                    users.role as roleUser, users.vkId as vkUserLink, users.instagramId as instagramUserLink, users.tel as phoneUser,
                    users.urlId as urlIdUser, users.selectAll as visibleUser,
                    users.email as emailUser,
                    (SELECT grouptable.name FROM grouptable WHERE grouptable.idTeacher = (select id FROM users WHERE urlId = @urlId) limit 1) as groupName,
                    (SELECT GROUP_CONCAT(achievementsuser.id) FROM achievementsuser WHERE achievementsuser.idUser = (select id FROM users WHERE urlId = @urlId)) as achievementsuserID,
                    (SELECT AVG(taskuser.mark) 
                        FROM users 
                        join tasks on YEAR(NOW()) = year(tasks.start) and
                        (
                        case 
                            when month(tasks.start) < 7 THEN 1
                            when month(tasks.start) > 7 THEN 1
                        end
                        )  = (
                        case 
                            when month(NOW()) < 7 THEN 1
                            when month(NOW()) > 7 THEN 1
                        end
                        )
                        JOIN taskuser ON taskuser.idUser = users.id and taskuser.idTask = tasks.id
                        where users.groupId = (SELECT grouptable.id FROM grouptable WHERE grouptable.idTeacher = (select id FROM users WHERE urlId = @urlId) limit 1)) as avgGroupMark,
                    (SELECT COUNT(achievements.id) FROM achievements WHERE achievements.role = 1) as countAllAchievements,
                    (SELECT COUNT(achievementsuser.id) FROM achievementsuser WHERE achievementsuser.idUser = (select id FROM users WHERE urlId = @urlId)) as countAchievements,
                    (SELECT COUNT(taskuser.id) 
                        FROM tasks 
                        join taskuser ON taskuser.idTask = tasks.id and taskuser.mark is not NULL 
                        where tasks.idUserCreated = (select id FROM users WHERE urlId = @urlId)) as countTaskVerified
                    FROM users
                    WHERE urlId = @urlId`,{urlId : `${query}`},(err, result)=>{
                        if (err) {
                            error = true
                            resolve()
                            console.log(err);
                            return
                        } 
                        if (result.length == 0) {
                            error = true
                            resolve()
                            return
                        }
                        resultObj.id = Number(result[0].idUser)
                        resultObj.isYou = (Number(idUserReq) == Number(result[0].idUser)) ? true : false
                        resultObj.info.userImage = result[0].imageUser
                        resultObj.info.role = userRole
                        resultObj.info.initials = result[0].FIOUser
                        resultObj.info.phrase = result[0].phraseUser
                        resultObj.info.course = null
                        resultObj.info.group = null
                        if (result[0].phoneUser) {
                            resultObj.info.contacts.push({id: 1, link: result[0].phoneUser, img: "TelephoneIcon", type: 'tel'})
                        }
                        if (result[0].vkUserLink) {
                            resultObj.info.contacts.push({id: 2, link: result[0].vkUserLink, img: "VkLogo", type: 'vk'})
                        }
                        
                        // resultObj.info.contacts.push({id: 3, link: result[0], img: InstagramLogo, type: 'inst'})
                        resultObj.settings.idUser = result[0].urlIdUser
                        resultObj.settings.visible = (result[0].visibleUser == 1) ? "teachers" : "all" 
                        // resultObj.settings.notification = (result[0].mailSendUser == 0) ? false : true 
                        resultObj.settings.email = result[0].emailUser
                        resultObj.settings.changedPasswordAgo = ((Date.now() - result[0].lastUpdatePasword)/(1000 * 60 * 60 * 24)).toFixed(0)
                        resultObj.stats.push({
                            id : 1,
                            title : "Средняя оценка вашей группы",
                            value : (result[0].avgGroupMark) ? result[0].avgGroupMark.toFixed(2) : 0,
                            name : "avg_mark"
                        })
                        resultObj.stats.push({
                            id : 2,
                            title : "Вы руководитель группы",
                            value : result[0].groupName,
                            name : "group"
                        })
                        resultObj.stats.push({
                            id : 3,
                            title : "Количество полученных достижений",
                            value : [result[0].countAchievements, result[0].countAllAchievements],
                            name : "achievements"
                        })
                        resultObj.stats.push({
                            id : 4,
                            title : "Количество проверенных заданий",
                            value : result[0].countTaskVerified,
                            name : "completed_tasks"
                        })
                        if (result[0].achievementsuserID !== null) {
                            result[0].achievementsuserID.split(",").forEach(el => {
                                achievementsArray.push(el.achievementsuserID)
                            });
                        } 
                        resolve()
                    })
                })
                break
            case 2 :
                error = true
                break
        }
        
        if (error) {
            res.sendStatus(422)
            return
        }

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
                    achievementsObj.image = result[0].image
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