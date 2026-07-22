const axios = require("axios");

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const REEL_ACTOR_URL = "https://api.apify.com/v2/acts/apify~instagram-reel-scraper/run-sync-get-dataset-items";

async function fetchReels(username) {
    const response = await axios.post(
        `${REEL_ACTOR_URL}?token=${APIFY_TOKEN}`,
        {
            username: [username],
            resultsLimit: 25
        },
        {
            headers: { "Content-Type": "application/json" },
            timeout: 300000
        }
    );

    console.log("========= REEL SCRAPER RESPONSE =========");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("==========================================");

    return Array.isArray(response.data) ? response.data : [];
}

module.exports = { fetchReels };