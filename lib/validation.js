const mysql = require('mysql')
const connection = require('./connetion')
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

module.exports = validationRegisterForm