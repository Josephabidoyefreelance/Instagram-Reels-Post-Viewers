const instagramService = require("../services/instagramService");

async function getProfile(req, res) {
    try {
        const username = req.params.username;
        const profile = await instagramService.getProfile(username);
        res.json(profile);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = {
    getProfile
};