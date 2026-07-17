const axios = require("axios");

const APIFY_TOKEN = process.env.APIFY_TOKEN;

const ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items";

async function fetchProfile(username) {

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
            headers:{
                "Content-Type":"application/json"
            },
            timeout:300000
        }
    );

    console.log("========= APIFY RESPONSE =========");
    console.log(JSON.stringify(response.data,null,2));
    console.log("===================================");

    return response.data[0];

}

module.exports={fetchProfile};