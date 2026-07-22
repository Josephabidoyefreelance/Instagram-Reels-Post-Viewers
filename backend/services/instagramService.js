const cache = require("./cache");
const providerService = require("./providerService");
const reelService = require("./reelService");

function mapPosts(rawPosts) {
    if (!Array.isArray(rawPosts)) return [];
    return rawPosts.map(p => ({
        id: p.id || p.shortCode || "",
        shortCode: p.shortCode || "",
        caption: p.caption || "",
        likes: p.likesCount ?? 0,
        comments: p.commentsCount ?? 0,
        views: p.videoViewCount ?? null,
        thumbnail: p.displayUrl || (Array.isArray(p.images) ? p.images[0] : "") || "",
        url: p.url || (p.shortCode ? `https://www.instagram.com/p/${p.shortCode}/` : ""),
        timestamp: p.timestamp || ""
    }));
}

// Overwrites the "views" field on any post that the dedicated Reel Scraper
// actually found real numbers for. Photo posts / unmatched posts are untouched.
function mergeReelViews(recentPosts, reelItems) {
    const viewsByShortCode = {};

    reelItems.forEach(r => {
        const code = r.shortCode || (r.url ? r.url.split("/").filter(Boolean).pop() : null);
        if (code) {
            viewsByShortCode[code] = r.videoPlayCount ?? r.videoViewCount ?? null;
        }
    });

    return recentPosts.map(post => {
        if (post.shortCode && viewsByShortCode[post.shortCode] != null) {
            return { ...post, views: viewsByShortCode[post.shortCode] };
        }
        return post;
    });
}

async function getProfile(username) {

    const cached = cache.get(username);

    if (cached) return cached;

    const profile = await providerService.fetchProfile(username);

    let recentPosts = mapPosts(profile.latestPosts);

    // Reel views come from a separate dedicated actor. If it fails or the
    // account has no reels, we just keep whatever the profile scraper gave us.
    try {
        const reels = await reelService.fetchReels(username);
        recentPosts = mergeReelViews(recentPosts, reels);
    } catch (err) {
        console.error(`Reel view fetch failed for ${username}:`, err.message);
    }

    const totalLikes = recentPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = recentPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalViews = recentPosts.reduce((sum, p) => sum + (p.views || 0), 0);

    const result = {
        success: true,
        source: "Apify",
        username: profile.username || "",
        fullName: profile.fullName || "",
        accountType: profile.isBusinessAccount
            ? "Business"
            : profile.isCreatorAccount
            ? "Creator"
            : "Personal",
        followers: profile.followersCount || 0,
        following: profile.followsCount || 0,
        posts: profile.postsCount || 0,
        bio: profile.biography || "",
        profilePicture: profile.profilePicUrl || "",
        verified: profile.verified || false,
        totalLikes,
        totalComments,
        totalViews,
        recentPosts
    };

    if (result.username && (result.followers > 0 || result.posts > 0 || result.fullName)) {
        cache.set(username, result);
    }

    return result;
}

module.exports = {
    getProfile
};