const cheerio = require('cheerio');
const got = require('got');
const iconv = require('iconv-lite');
const connection = require('../../lib/connetion')

let teacherSchedule = {}
let date = new Date(0)
let dataUpdate

const deleteN = (text) => {
    return text.trim().split("\n").join('').split("\"").join('')
}

const parse = async() => {
    const oneUrl = 'https://spt42.ru/exp_raspisanie/2_korpus/cp.htm'
    let bodyIneUrld
    await new Promise((resolve)=>{
        got.stream(oneUrl)
            .pipe(iconv.decodeStream('win1251'))
            .collect((err, body) => {
                bodyIneUrld = body
                resolve()
            })
    })

    let $ = cheerio.load(bodyIneUrld)
    let dateUpdate = $('.ref').text().split(' ')[1].split('.')

    await new Promise((resolve,reject)=>{
        connection.query(`SELECT * FROM scheduleteacher ORDER BY dataUpdate DESC LIMIT 1`, (err,resultCon) => {
            if (resultCon.length > 0) {
                dataUpdate = resultCon[0].dataUpdate
            } else {
                dataUpdate = "1970-01-01"
            }
            resolve()
        })
    })

    if (new Date(dataUpdate).getTime() == new Date(dateUpdate[2],Number(dateUpdate[1])-1,Number(dateUpdate[0])).getTime()) {
        console.log('Уже новое расписание для учителей')
    } else {
        console.log('Обновление расписания учителей')
        let dateText = `${dateUpdate[2]}-${Number(dateUpdate[1])}-${Number(dateUpdate[0])-3}`
        date = new Date(dateText)
        new Promise((resolve,reject)=>{
            console.log(`DELETE FROM scheduleteacher WHERE date < '${dateText}'`,date);
            connection.query(`DELETE FROM scheduleteacher WHERE date < '${dateText}'`,(err,result)=>{
                resolve()
            })
        })
        await new Promise((resolve)=>{
            $('.inf').find("tbody").find('tr').each((i, el)=>{
                if (i < 1) {
                    return
                }
    
                teacherSchedule[$(el).find('td:nth-child(2)').text()] = {
                    name : $(el).find('td:nth-child(2)').text(),
                    href : $(el).find('td:nth-child(2) > a').attr('href').toString()
                }
            })
            resolve()
        })
    }

    for (const key in teacherSchedule) {
        const element = teacherSchedule[key]
        let bodyShueld
        await new Promise((resolve)=>{
            got.stream(`https://spt42.ru/exp_raspisanie/2_korpus/${element.href}`)
                .pipe(iconv.decodeStream('win1251'))
                .collect((err, body) => {
                    bodyShueld = body
                    resolve()
                })
        })
        $ = cheerio.load(bodyShueld)
        await new Promise((resolve)=>{
            $('.inf').find("tbody").find('tr').each((i, el)=>{
                if (i < 2) {
                    return
                }
                if ($(el).find('.hd0') != '') {
                    return
                }
                if ($(el).find("td:nth-child(1)").attr('rowspan') == "8") {

                    day = `${$(el).find("td:nth-child(1)").html()}`
                    weekEv = ''
                    if (day.split('<br>')[1].split('-')[1] == '1') {
                        weekEv = 'Нечётная'
                    } else {
                        weekEv = 'Чётная'
                    }
                    dateLesson = day.split('<br>')[0].split('.')
                    teacherSchedule[key][`${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`] = {
                        schedule : [],
                        weekEven : weekEv
                    }
                    lesson = `lessonNum${$(el).find("td:nth-child(2)").text()}`
                    lessonNumber = `${$(el).find("td:nth-child(2)").text()}`
                    if ($(el).find(".ur").attr('colspan') == "1") {
                        teacherSchedule[key][`${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`].schedule.push([
                                {
                                    id : lessonNumber + '1',
                                    lessonNumber : lessonNumber,
                                    teacher: deleteN($(el).find('td:nth-child(3)').find('.z1').text()),
                                    auditorium: $(el).find('td:nth-child(3)').find('.z2').text(),
                                    lessonName: $(el).find('td:nth-child(3)').find('.z3').text(),
                                },
                                {
                                    id : lessonNumber + '2',
                                    lessonNumber : lessonNumber,
                                    teacher: deleteN($(el).find('td:nth-child(4)').find('.z1').text()),
                                    auditorium: $(el).find('td:nth-child(4)').find('.z2').text(),
                                    lessonName: $(el).find('td:nth-child(4)').find('.z3').text()
                                }
                            ]
                        )
                    } else {
                        teacherSchedule[key][`${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`].schedule.push({
                            id : lessonNumber,
                            lessonNumber : lessonNumber,
                            teacher : deleteN($(el).find('.ur').find('.z1').text()),
                            auditorium: $(el).find('.ur').find('.z2').text(),
                            lessonName: $(el).find('.ur').find('.z3').text()
                        })
                    }
                } else {
                    lesson = `lessonNum${$(el).find("td:nth-child(1)").text()}`
                    lessonNumber = `${$(el).find("td:nth-child(1)").text()}`
                    if ($(el).find(".ur").attr('colspan') == "1") {
                        teacherSchedule[key][`${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`].schedule.push([
                                {
                                    id : lessonNumber + '1',
                                    lessonNumber : lessonNumber,
                                    teacher: deleteN($(el).find('td:nth-child(2)').find('.z1').text()),
                                    auditorium: $(el).find('td:nth-child(2)').find('.z2').text(),
                                    lessonName: $(el).find('td:nth-child(2)').find('.z3').text(),
                                },
                                {
                                    id : lessonNumber + '2',
                                    lessonNumber : lessonNumber,
                                    teacher: deleteN($(el).find('td:nth-child(3)').find('.z1').text()),
                                    auditorium: $(el).find('td:nth-child(3)').find('.z2').text(),
                                    lessonName: $(el).find('td:nth-child(3)').find('.z3').text()
                                }
                            ]
                        )
                    } else {
                        teacherSchedule[key][`${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`].schedule.push({
                            id : lessonNumber,
                            lessonNumber : lessonNumber,
                            teacher : deleteN($(el).find('.ur').find('.z1').text()),
                            auditorium: $(el).find('.ur').find('.z2').text(),
                            lessonName: $(el).find('.ur').find('.z3').text()
                        })
                    }
                }

                
            })
            resolve()
        })
    }

    for (const key in teacherSchedule) {
        const el = teacherSchedule[key]
        let error = false
        let idTeacher
        await new Promise((resolve)=>{
            connection.query(`SELECT id FROM users WHERE fio = '${key}' and role = '1'`,(err,result)=>{
                if (result.length == 0) {
                    error = true
                    resolve()
                    return
                }
                idTeacher = result[0].id
                resolve()
            })
        })
        if (error) continue

        for (el2 in teacherSchedule[key]) {
            if (el2 == "name" || el2 == "href") {
                continue
            }
            let idScheduleTeacher
            localDate = new Date(el2)
            await new Promise((resolve,reject)=>{
                connection.query(`SELECT * FROM scheduleteacher WHERE date = '${el2}' and idTeacher = '${idTeacher}' `, (err,resultCon) => {
                    if (resultCon.length > 0) {
                        idScheduleTeacher = resultCon[0].id
                    } else {
                        idScheduleTeacher = 0
                    }
                    resolve()
                })
            })
            if (idScheduleTeacher != 0) {
                await new Promise((resolve,reject)=>{
                    connection.query(`UPDATE scheduleteacher SET scheduleJSON = '${JSON.stringify(teacherSchedule[key][el2])}', dataUpdate = '${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()+3}' WHERE id = '${idScheduleTeacher}'`,(err,resultCon)=>{
                        if (err) resolve()
                        resolve()
                    })
                })
            } else {
                await new Promise((resolve,reject)=>{
                    connection.query(`INSERT INTO scheduleteacher (idTeacher, date, scheduleJSON,dataUpdate) VALUES ('${idTeacher}', '${el2}', '${JSON.stringify(teacherSchedule[key][el2])}','${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()+3}')`,(err,resultCon)=>{
                        if (err) resolve()
                        resolve()
                    })
                })
            }
        }
    }
    console.log('Обновилось расписание учителей')
}


module.exports = parse