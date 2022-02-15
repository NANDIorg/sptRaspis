const express = require('express')
const md5 = require('md5')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const validationRegisterForm = require('./lib/validation')
const connection = require('./lib/connetion')
const makeToken = require('./lib/random')
const auth = require('./lib/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

connection.connect();

//* GET

app.get('/', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    console.log(ip);
    connection.query('SELECT * FROM sptraspis.users',(err, result, fields)=>{
        if (err) {
            console.log(err)
            return
        }
        // console.log(result)
        res.send(result)
    })
})

app.get('/api/confirmAccount/:id',(req,res) => {
    const paramsId = req.params.id
    connection.query(`UPDATE users SET confirm = '1' WHERE (id = '${paramsId}')`,(err, result)=>{
        if (err) {
            res.status(500).end()
            return
        } 
        res.status(200).end()
    })
})

app.get('/api/getUser', (req, res)=>{
    const query = req.query.token
    connection.query(`SELECT * FROM users WHERE token = '${query}'`,(err, result)=>{
        if (err) return 
        res.status(200).send(result[0])
    })
})

//* POST

app.post('/api/auth', (req, res) => {
    const body = req.body
    const token = makeToken()
    auth(body.login,md5(body.password),token).then(result => {
        if (result.status == 200) {
            res.status(200).send(token)
        } else {
            res.status(500).send(result.body)
        }
    })
})

app.post('/api/registration',(req, res)=>{
    const body = req.body
    validationRegisterForm(body.login, body.password, body.email, body.fio).then(result => {
            const returnValidation = result
            if (returnValidation.status == 500) {
                res.status(500).send(returnValidation.body)
            } else {
                connection.query(`INSERT INTO users (login, password, email, fio, group) VALUES ('${body.login.trim()}', '${md5(body.password.trim())}', '${body.email.trim()}', '${body.fio.trim()}', '${body.groupId}')`, (err, result, fields)=>{
                    if (err) return err
                    res.status(200).send('Ок')  
                })
            }
        })
    
})

//* Функции



app.listen(3000)