const mysql = require('mysql')
const connection = mysql.createConnection({
    host : "localhost",
    user: "nandinew",
    password: "nandiroot56",
    insecureAuth : true,
    database : 'sptraspis'
})
module.exports = connection