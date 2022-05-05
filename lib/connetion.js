const mysql = require('mysql')
const connection = mysql.createConnection({
    host : "localhost",
    user: "root",
    password: "nandiroot",
    insecureAuth : true,
    database : 'sptraspis'
})
module.exports = connection