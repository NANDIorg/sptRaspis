const mysql = require('mysql')
const connection = mysql.createConnection({
    host : "localhost",
    user: "nandinew",
    password: "nandiroot56",
    insecureAuth : true,
    database : 'sptraspis'
})

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\@(\w+)/g, function (txt, key) {
      if (values.hasOwnProperty(key)) {
        return this.escape(values[key]);
      }
      return txt;
    }.bind(this));
  };

module.exports = connection