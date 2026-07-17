const cache = require("./cache");
const providerService = require("./providerService");

function mapPosts(rawPosts) {
    if (!Array.isArray(rawPosts)) return [];
    return rawPosts.map(p => ({
        id: p.id || p.shortCode || "",
        caption: p.caption || "",
        likes: p.likesCount ?? 0,
        comments: p.commentsCount ?? 0,
        views: p.videoViewCount ?? null,
        thumbnail: p.displayUrl || (Array.isArray(p.images) ? p.images[0] : "") || "",
        url: p.url || (p.shortCode ? `https://www.instagram.com/p/${p.shortCode}/` : ""),
        timestamp: p.timestamp || ""
    }));
}

async function getProfile(username) {

    const cached = cache.get(username);

    if (cached) return cached;

    const profile = await providerService.fetchProfile(username);

    const recentPosts = mapPosts(profile.latestPosts);
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