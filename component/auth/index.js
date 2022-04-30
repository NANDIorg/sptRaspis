const auth = require('./auth')
const makeToken = require('./createToken')
const express = require('express')
const md5 = require('md5')
const router = express.Router()

router.post('/api/auth', async (req, res) => {
    let result = {
        resultLogin : false
    }
    const body = req.body
    const token = makeToken()
    if (body.login == null || body.password == null) {
        result.resultLogin = false
    } else {
        result = await auth(body.login,md5(body.password),md5(token))
    }
    if (result.resultLogin) {
        res.status(200).send({
            token : token,
            role : result.role
        })
    } else {
        res.status(403).send({error : "Ошибка входа"})
    }
})

module.exports = router