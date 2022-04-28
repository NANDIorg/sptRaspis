const auth = require('./auth')
const makeToken = require('./createToken')
const express = require('express')
const md5 = require('md5')
const router = express.Router()

router.post('/api/auth', async (req, res) => {
    let result = false
    const body = req.body
    const token = makeToken()
    if (body.login == null || body.password == null) {
        result = false
    } else {
        result = await auth(body.login,md5(body.password),md5(token))
    }
    if (result) {
        res.status(200).send(token)
    } else {
        res.status(500).send({error : "Ошибка входа"})
    }
})

module.exports = router