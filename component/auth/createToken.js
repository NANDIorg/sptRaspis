function makeToken () {
    let text = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM$'
    let result = ''
    for (let i = 0; i < 50; i++) {
        result += text[getRandomInt(text.length)]
    }
    return result
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = makeToken