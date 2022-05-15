const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const PORT = 13372
const connection = require('./lib/connetion')
connection.connect((err)=> {
    if (err) {
        return console.error("Ошибка: " + err.message);
      }
      else{
        console.log("Подключение к серверу MySQL успешно установлено");
      }
});
const md5 = require('md5')

const adminAPI = require('./component/admin/index')
const authComponent = require('./component/auth/index')
const userComponent = require('./component/user/index')
const groupFaculty = require('./component/groupFaculty/index')
const schueld = require('./component/schedule/index')
const teacher = require('./component/teacher/index')
const loadFile = require('./lib/loadFile')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(teacher)
app.use(schueld())
app.use(adminAPI())
app.use(authComponent)
app.use(userComponent())
app.use(groupFaculty)
app.use(loadFile)

// app.use(griupScheduleComponent)

app.use("/userAvatar", express.static(path.join(__dirname,"assets/image/userAvatar")))
app.use("/achievements", express.static(path.join(__dirname,"assets/image/achievements")))
app.use("/tasksFile", express.static(path.join(__dirname,"assets/tasksFile")))

app.get('/', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    console.log(ip);
    res.end()
})

app.get('/*', (req, res) => {
    res.status(404).send("Ты кто GET")
})
app.post('/*', (req, res) => {
    res.status(404).send('ты кто POST')
})

console.log(PORT);

app.listen(PORT)