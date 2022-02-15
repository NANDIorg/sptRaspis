const nodemailer = require('nodemailer')
const trans = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'selestiaMinecraft@yandex.ru',
        pass: 'cebotwoycgrpotvp' //enEr532Hv0cErKzHmiqx пароль от mail ru
    }
}, {
    from: 'Selestia <selestiaMinecraft@yandex.ru>'
})

const mailer = message => {
    trans.sendMail(message, (err, info) => {
        if (err) return console.log(err)
        console.log('Email send :' + info)
    })
}

module.exports = mailer