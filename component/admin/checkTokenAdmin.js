const md5 = require('md5')
const connection = require('../../lib/connetion')

async function checkAdmin (token) {
    let rr = {}
    await new Promise((resolve)=>{
        connection.query(`SELECT \`role\` FROM \`users\` WHERE \`token\` = '${md5(token)}'`,(err, result)=>{
            console.log(md5(token));
            if (result.length == 1) {
                rr = {
                    status : 200,
                    role : result[0].role
                }
            } else {
                rr = {
                    status : 500
                }
            }
            resolve()
        })
    })
    if (rr.status != 200) {
        return false
    }
    if (rr.role >= 2) {
        return true
    }
}

module.exports = checkAdmin