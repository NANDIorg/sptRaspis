const express = require('express')
const router = express.Router()
const connection = require('../../lib/connetion')

router.get('/api/getUserToken', (req, res)=>{
    const query = req.query.token
    connection.query(`
    SELECT \`users\`.\`fio\`, \`users\`.\`online\`, \`users\`.\`image\`, \`users\`.\`wordsUser\`, 
    \`users\`.\`role\`, \`users\`.\`vkId\`, \`users\`.\`instagramId\`, \`users\`.\`tel\`, \`groupTable\`.\`name\`
    FROM users 
    JOIN groupTable ON \`groupTable\`.\`id\` = \`users\`.\`groupId\`
    WHERE \`token\` = '${query}'`,(err, result)=>{
        if (err) return 
        res.status(200).send(result[0])
    })
})

router.get('/api/getUserId', (req, res)=>{
    const query = req.query.urlId
    connection.query(`
    SELECT \`users\`.\`fio\`, \`users\`.\`online\`, \`users\`.\`image\`, \`users\`.\`wordsUser\`, 
    \`users\`.\`role\`, \`users\`.\`vkId\`, \`users\`.\`instagramId\`, \`users\`.\`tel\`, \`groupTable\`.\`name\`
    FROM users 
    JOIN groupTable ON \`groupTable\`.\`id\` = \`users\`.\`groupId\`
    WHERE urlId = '${query}'`,(err, result)=>{
        if (err) return 
        res.status(200).send(result[0])
    })
})

module.exports = router