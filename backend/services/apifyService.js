const axios = require("axios");

const APIFY_TOKEN = process.env.APIFY_TOKEN;

const ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items";

// A real account with several posts realistically wouldn't have 0-1 followers.
// This catches the partial-block pattern: bio/postsCount come through fine,
// but followersCount gets stuck near zero.
function looksBlocked(item) {
    if (!item) return true;
    const suspiciouslyLowFollowers = (item.followersCount ?? 0) <= 1;
    const hasOtherRealData = (item.postsCount ?? 0) > 3 || !!item.biography;
    return suspiciouslyLowFollowers && hasOtherRealData;
}

async function fetchProfileOnce(username) {
    const response = await axios.post(
        `${ACTOR_URL}?token=${APIFY_TOKEN}`,
        {
            usernames: [username],
            proxyConfiguration: {
                useApifyProxy: true,
                apifyProxyGroups: ["RESIDENTIAL"]
            }
        },
        {
            headers: { "Content-Type": "application/json" },
            timeout: 300000
        }
    );

    return response.data[0];
}

async function fetchProfile(username, attempt = 1) {
    const MAX_ATTEMPTS = 3;

    const item = await fetchProfileOnce(username);

    console.log(`========= APIFY RESPONSE (attempt ${attempt}) =========`);
    console.log(JSON.stringify(item, null, 2));
    console.log("===================================");

    if (looksBlocked(item) && attempt < MAX_ATTEMPTS) {
        console.log(`Looks blocked/incomplete. Retrying (${attempt + 1}/${MAX_ATTEMPTS})...`);
        await new Promise(r => setTimeout(r, 3000));
        return fetchProfile(username, attempt + 1);
    }

    return item;
}

module.exports = { fetchProfile };