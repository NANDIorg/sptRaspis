function validateUN (x) {
    if (x === undefined || x === null) {
        return false
    }
    return true
}

function validateU (x) {
    if (x === undefined) {
        return false
    }
    return true
}

function validateN (x) {
    if (x === null) {
        return false
    }
    return true
}

module.exports = {validateUN, validateU, validateN}