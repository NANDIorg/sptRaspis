const cheerio = require('cheerio');
const got = require('got');
const iconv = require('iconv-lite');
const connection = require('../../lib/connetion')

let hrefGroup = []
let groupSchedule = {}
let date = new Date(0)
let dataUpdate
let resultArr = []

async function parse () {

    await new Promise((resolve,reject)=>{
        connection.query(`SELECT * FROM \`schedulegroup\` ORDER BY \`dataUpdate\` DESC LIMIT 1`, (err,resultCon) => {
            // console.log(resultCon);
            if (resultCon.length > 0) {
                dataUpdate = resultCon[0].dataUpdate
            } else {
                dataUpdate = "1970-01-01"
            }
            resolve()
        })
    })

    const deleteN = (text) => {
        return text.trim().split("\n").join('').split("\"").join('')
    }

    function parseGroup (a) {
        const $ = cheerio.load(a)
        let dateUpdate = $('.ref').text().split(' ')[1].split('.')
        if (new Date(dataUpdate).getTime() == new Date(dateUpdate[2],Number(dateUpdate[1])-1,Number(dateUpdate[0])).getTime()) {
            console.log('Уже новая');
        } else {
            console.log('Обновление');
            let dateText = `${dateUpdate[2]}-${Number(dateUpdate[1])}-${Number(dateUpdate[0])}`
            date = new Date(dateText)
            new Promise((resolve,reject)=>{
                console.log(`DELETE FROM \`schedulegroup\` WHERE \`date\` < '${dateText}'`,date);
                connection.query(`DELETE FROM \`schedulegroup\` WHERE \`date\` < '${dateText}'`,(err,result)=>{
                    resolve()
                })
            })
            let table = $('.inf').find("tbody").find('tr').each((i, el) => {
                if (i < 1) {
                    return
                }
                groupSchedule[$(el).find('td:nth-child(2)').text()] = {
                    name : $(el).find('td:nth-child(2)').text(),
                    href : $(el).find('td:nth-child(2) > a').attr('href').toString()
                }
            })
        }
    }

    function parseGrouhSchedule (gr, a) {
        const $ = cheerio.load(a)
        let lesson, day
        let table = $('.inf').find("tbody").find('tr').each((i, el) => {
            if (i < 3) {
                return
            }
            if ($(el).find('.hd0') != '') {
                return
            }
            let obj = {}
            if ($(el).find("td:nth-child(1)").attr('rowspan') == "8") {
                day = `${$(el).find("td:nth-child(1)").html()}`
                weekEv = ''
                if (day.split('<br>')[1].split('-')[1] == '1') {
                    weekEv = 'Нечётная'
                } else {
                    weekEv = 'Чётная'
                }
                dateLesson = day.split('<br>')[0].split('.')
                
                groupSchedule[gr][day] = {
                    date : `${dateLesson[2]}-${Number(dateLesson[1])}-${Number(dateLesson[0])}`,
                    weekEven : weekEv
                }
                lesson = `lessonNum${$(el).find("td:nth-child(2)").text()}`
            } else {
                lesson = `lessonNum${$(el).find("td:nth-child(1)").text()}`
            }
            if ($(el).find(".ur").attr('colspan') == "1") {
                groupSchedule[gr][day][lesson] = {
                    length: 2,
                    lessonName1: deleteN($(el).find('td:nth-child(3)').find('.z1').text()),
                    lessonName2: deleteN($(el).find('td:nth-child(4)').find('.z1').text()),
                    Auditorium1: $(el).find('td:nth-child(3)').find('.z2').text(),
                    Auditorium2: $(el).find('td:nth-child(4)').find('.z2').text(),
                    Teacher1: $(el).find('td:nth-child(3)').find('.z3').text(),
                    Teacher2: $(el).find('td:nth-child(4)').find('.z3').text()
                }
            } else {
                groupSchedule[gr][day][lesson] = {
                    length: 1,
                    lessonName: deleteN($(el).find('.ur').find('.z1').text()),
                    Auditorium: $(el).find('.ur').find('.z2').text(),
                    Teacher: $(el).find('.ur').find('.z3').text()
                }
            }
        })
    }

    await new Promise((resolve, reject)=>{
        url = 'https://spt42.ru/exp_raspisanie/2_korpus/cg.htm'
        got.stream(url)
            .pipe(iconv.decodeStream('win1251'))
            .collect((err, body) => {
                parseGroup(body)
                resolve()
            })
    })

    

    for (el in groupSchedule) {
        await new Promise((resolve, reject)=>{
            let url = `https://spt42.ru/exp_raspisanie/2_korpus/${groupSchedule[el].href}`
            got.stream(url)
                .pipe(iconv.decodeStream('win1251'))
                .collect((err, body) => {
                    parseGrouhSchedule(groupSchedule[el].name, body)
                    resolve()
                })
        })
    }

    

    for (el in groupSchedule) {
        let idGroup = 0
        await new Promise((resolve,reject)=>{
            connection.query(`SELECT * FROM \`grouptable\` WHERE \`name\` = '${el}'`,(err, result)=>{
                if (result[0] == undefined) {
                    // console.log('Такой группы не существует, обратитесь к системному администратору',el);
                    resolve()
                } else {
                    // console.log(result[0].id,el);
                    idGroup = result[0].id
                    resolve()    
                }
            })
        })
        // console.log(idGroup);
        if (idGroup != 0) {
            for (el2 in groupSchedule[el]) {
                if (el2 == "name" || el2 == "href") {
                    continue
                }
                let idSchedulegroup
                let dataI = groupSchedule[el][el2].date
                localDate = new Date(dataI)
                // console.log(idGroup,dataI,JSON.stringify(groupSchedule[el][el2]));
                await new Promise((resolve,reject)=>{
                    connection.query(`SELECT * FROM \`schedulegroup\` WHERE \`date\` = '${dataI}' and \`idGroup\` = '${idGroup}' `, (err,resultCon) => {
                        if (resultCon.length > 0) {
                            idSchedulegroup = resultCon[0].id
                        } else {
                            idSchedulegroup = 0
                        }
                        resolve()
                    })
                })

                if (idSchedulegroup != 0) {
                    await new Promise((resolve,reject)=>{
                        connection.query(`UPDATE \`schedulegroup\` SET \`scheduleJSON\` = '${JSON.stringify(groupSchedule[el][el2])}', \`dataUpdate\` = '${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}' WHERE \`id\` = '${idSchedulegroup}'`,(err,resultCon)=>{
                            if (err) resolve()
                            // console.log(resultCon);
                            resolve()
                        })
                    })
                } else {
                    await new Promise((resolve,reject)=>{
                        connection.query(`INSERT INTO \`schedulegroup\` (\`idGroup\`, \`date\`, \`scheduleJSON\`,\`dataUpdate\`) VALUES ('${idGroup}', '${dataI}', '${JSON.stringify(groupSchedule[el][el2])}','${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}')`,(err,resultCon)=>{
                            if (err) resolve()
                            // console.log(resultCon);
                            resolve()
                        })
                    })
                }
                // console.log(`INSERT INTO \`schedulegroup\` (\`idGroup\`, \`date\`, \`scheduleJSON\`) VALUES ('${idGroup}', '${dataI}', '${JSON.stringify(groupSchedule[el][el2])}') ON DUPLICATE KEY UPDATE \`scheduleJSON\`='${JSON.stringify(groupSchedule[el][el2])}'`);
                
            }
            
        }
    }
    // console.log(groupSchedule);
    console.log('Обновилось')
}

parse()

setInterval(()=>{
    console.log(date);
    parse()
},3600000)

// module.exports = groupSchedule