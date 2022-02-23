const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// const md5 = require('md5')
// const mysql = require('mysql')
// const validationRegisterForm = require('./lib/validation')
const connection = require('./lib/connetion')

connection.connect();

const authComponent = require('./component/auth/auth')
const userComponent = require('./component/user/index')
const griupScheduleComponent = require('./component/schedule/group')
const pages = require('./pages')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(authComponent)
app.use(userComponent)
app.use(griupScheduleComponent)
app.use(pages)
// createGroupSchedule()


//* GET

app.get('/', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    console.log(ip);
    // connection.query('SELECT * FROM sptraspis.users',(err, result, fields)=>{
    //     if (err) {
    //         console.log(err)
    //         return
    //     }
    //     // console.log(result)
    //     res.send(result)
    // })
})

//* POST



// app.post('/api/registration',(req, res)=>{
//     const body = req.body
//     validationRegisterForm(body.login, body.password, body.email, body.fio).then(result => {
//             const returnValidation = result
//             if (returnValidation.status == 500) {
//                 res.status(500).send(returnValidation.body)
//             } else {
//                 connection.query(`INSERT INTO users (login, password, email, fio, group) VALUES ('${body.login.trim()}', '${md5(body.password.trim())}', '${body.email.trim()}', '${body.fio.trim()}', '${body.groupId}')`, (err, result, fields)=>{
//                     if (err) return err
//                     res.status(200).send('Ок')  
//                 })
//             }
//         })
    
// })

//* Функции



app.listen(3000)