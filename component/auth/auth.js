const connection = require('../../lib/connetion')

async function auth (login, password, token) {
    console.log(login, password);
    let res = {
        resultLogin : false,
        role : 0
    }
    await new Promise((resolve, reject)=>{
        connection.query(`SELECT id, role FROM users WHERE login = '${login}' and password = '${password}'`,(err, result)=>{
            if (err) {
                resolve()
            }
            if (result.length != 0) {
                res.resultLogin = true
                res.role = result[0].role
            }
            resolve()
        })
    })
    if (!res.resultLogin) return res

    await new Promise((resolve, reject)=>{
        connection.query(`UPDATE users SET token = '${token}', online = '1' WHERE (login = '${login}')`,(err, result)=>{
            if (err) {
                resolve()
            }
            resolve()
        })
    })
    return res
}
module.exports = auth