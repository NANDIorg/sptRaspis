const connection = require('../../lib/connetion')

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
                objResult.status = 100
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
module.exports = auth