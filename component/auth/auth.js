const connection = require('../../lib/connetion')

async function auth (login, password, token) {
    let resultLogin = false
    await new Promise((resolve, reject)=>{
        connection.query(`SELECT id FROM users WHERE login = '${login}' and password = '${password}'`,(err, result)=>{
            if (err) {
                resolve()
            }
            if (result.length != 0) {
                resultLogin = true
            }
            resolve()
        })
    })
    if (!resultLogin) return resultLogin

    await new Promise((resolve, reject)=>{
        connection.query(`UPDATE users SET token = '${token}', online = '1' WHERE (login = '${login}')`,(err, result)=>{
            if (err) {
                resolve()
            }
            resolve()
        })
    })
    return resultLogin
}
module.exports = auth