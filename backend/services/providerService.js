const apifyService = require("./apifyService");

async function fetchProfile(username) {
    return await apifyService.fetchProfile(username);
}

module.exports = {
    fetchProfile
};