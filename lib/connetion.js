const mysql = require('mysql')
const connection = mysql.createConnection({
    host : "localhost",
    user: "nandinew",
    password: "nandiroot56",
    database : 'sptraspis'
})
module.exports = connection