const express = require('express')
const router = express.Router()
const fs = require('fs')

router.get('/testApi',(req,res)=>{
    fs.readFile('pages/index.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    })
})

module.exports = router