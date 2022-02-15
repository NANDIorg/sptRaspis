const express = require('express')
const md5 = require('md5')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const mailer = require('./lib/nodemailer')
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
    console.log(paramsId);
    connection.query(`UPDATE users SET confirm = '1' WHERE (id = '${paramsId}')`)
    res.end()
})

//* POST

app.post('/api/auth', (req, res) => {
    const body = req.body
    const token = makeToken()
    auth(body.login,body.password,token).then(result => {
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
            console.log(123);
            if (returnValidation.status == 500) {
                res.status(500).send(returnValidation.body)
            } else {
                connection.query(`INSERT INTO users (login, password, email, fio) VALUES ('${body.login.trim()}', '${body.password.trim()}', '${body.email.trim()}', '${body.fio.trim()}')`, (err, result, fields)=>{
                    if (err) return err
                    let message = {
                        to: `${body.email.trim()}`,
                        subject: 'Подтверди',
                        html: `
                        <h1>Подтвердите ваш аккаунт ${body.login.trim()}</h1>
                        <a href="#">123</a>
                        `
                    }
                    mailer(message)
                    res.status(200).send('Ок')  
                })
            }
        })
    
})

//* Функции

async function validationRegisterForm (login, password, email, fio) {
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
    if (result.status == 500) return result

    await new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM users WHERE login = '${login.trim()}'`, (err, res, fields) => {
            if (err) {
                console.log(err);
                result.status = 500
                reject(err)
            }
            console.log('mysql');
            if (res.length != 0) {
                result.status = 500
                result.body['login'] = 'Пользователь с таким login уже существует'
            }
            resolve();
        })
    })
    if (result.status == 500) return result

    await new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM users WHERE email = '${email.trim()}'`, (err, res, fields) => {
            if (err) {
                console.log(err);
                result.status = 500
                reject(err)
            }
            console.log('mysql2');
            if (res.length != 0) {
                result.status = 500
                result.body['email'] = 'Пользователь с таким email уже существует'
            }
            resolve();
        })
    })
    return result
}

function makeToken () {
    let text = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM'
    let result = ''
    for (let i = 0; i < 50; i++) {
        result += text[getRandomInt(text.length)]
    }
    return result
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function auth (login, password, token) {
    let objResult = {
        status : 200,
        body : {}
    }
    await new Promise((resolve, reject)=>{
        connection.query(`SELECT id FROM users WHERE login = '${login}' and password = '${password}'`,(err, result)=>{
            if (err) {
                objResult.status = 500
                reject()
            }
            if (result.length == 0) {
                objResult.status = 500
                objResult.body['err'] = 'Логин или пароль не верны'
            }
            resolve()
        })
    })
    if (objResult.status == 500) return objResult

    await new Promise((resolve, reject)=>{
        connection.query(`UPDATE users SET token = '${token}', online = '1' WHERE (login = '${login}')`,(err, result)=>{
            if (err) {
                objResult.status = 500
                reject()
            }
            resolve()
        })
    })
    return objResult
}

app.listen(3000)