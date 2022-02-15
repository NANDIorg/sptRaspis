const express = require('express')
const md5 = require('md5')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const connection = mysql.createConnection({
    host : "localhost",
    user: "nandinew",
    password: "nandiroot56",
    insecureAuth: true,
    database : 'sptraspis'
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

connection.connect();

//* GET

app.get('/', function (req, res) {
    connection.query('SELECT * FROM sptraspis.users',(err, result, fields)=>{
        if (err) {
            console.log(err)
            return
        }
        console.log(result)
        res.send(result)
    })
})

//* POST

app.post('/api/registration',(req, res)=>{
    const body = req.body
    const returnValidation = validationRegisterForm(body.login, body.password, body.email, body.fio)
    if (returnValidation.status == 500) {
        res.status(500).send('Ошибка')
    } else {
        res.status(200).send('Ок')
    }
})

//* Функции

function validationRegisterForm (login, password, email, fio) {
    const emailRegExp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g
    let result = {
        status : 200,
        body : {}
    }
    if (login.trim().length == 0) {
        result.body['login'] = "Поле login не заполнено"
        result.status = 500
    }
    if (password.trim().length == 0) {
        result.body['password'] = "Поле password не заполнено"
        result.status = 500
    }
    if (email.trim().length == 0) {
        result.body['email'] = "Поле email не заполнено"
        result.status = 500
    }
    if (fio.trim().length == 0) {
        result.body['fio'] = "Поле fio не заполнено"
        result.status = 500
    }
    if (result.status == 500) return result
    
    if (!emailRegExp.test(email.trim())) {
        result.status = 500
        result.body['email'] = 'Не правильно введён email'
    }
    return result
}

app.listen(3000)