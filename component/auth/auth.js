const auth = require('../../lib/auth')
const makeToken = require('../../lib/random')
const express = require('express')
const router = express.Router()

router.post('/api/auth', (req, res) => {
    const body = req.body
    const token = makeToken()
    auth(body.login,md5(body.password),token).then(result => {
        if (result.status == 200) {
            res.status(200).send(token)
        } else {
            res.status(500).send(result.body)
        }
    })
})

module.exports = router