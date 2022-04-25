const auth = require('./auth')
const makeToken = require('./createToken')
const express = require('express')
const md5 = require('md5')
const router = express.Router()

router.post('/api/auth', (req, res) => {
    const body = req.body
    const token = makeToken()
    auth(body.login,md5(body.password),md5(token)).then(result => {
        if (result.status == 200) {
            res.status(200).send(token)
        } else {
            res.status(500).send(result.body)
        }
    })
})

module.exports = router