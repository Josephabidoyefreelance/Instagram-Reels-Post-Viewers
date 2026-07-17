function success(data) {
    return {
        success: true,
        data
    };
}

function error(message) {
    return {
        success: false,
        message
    };
}

module.exports = {
    success,
    error
};