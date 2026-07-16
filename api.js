const API_BASE = "http://localhost:3000/api";

async function getProfile(username){

    const clean = username
        .replace("https://www.instagram.com/","")
        .replace("https://instagram.com/","")
        .replace("@","")
        .split("/")[0]
        .trim();

    const response = await fetch(`${API_BASE}/profile/${clean}`);

    if(!response.ok){
        throw new Error("Unable to fetch profile");
    }

    return await response.json();

}

async function searchProfiles(){

    const input = document
        .getElementById("searchInput")
        .value
        .trim();

    if(!input) return;

    const loading = document.getElementById("loadingBox");
    const container = document.getElementById("profilesContainer");

    loading.style.display="block";

    const names=input
        .split(/[\n, ]+/)
        .filter(Boolean);

    for(const username of names){

        try{

            const profile=await getProfile(username);

            addProfile(profile);

        }

        catch(e){

            console.log(e);

        }

    }

    loading.style.display="none";

}

document
.getElementById("searchBtn")
.addEventListener("click",searchProfiles);

document
.getElementById("searchInput")
.addEventListener("keypress",function(e){

if(e.key==="Enter"){

searchProfiles();

}

});