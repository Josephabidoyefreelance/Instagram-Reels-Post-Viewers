const cache = new Map();
const TTL_MS = 15 * 60 * 1000; // 15 minutes

function get(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

function set(key, value) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + TTL_MS
    });
}

function remove(key) {
    cache.delete(key);
}

function clear() {
    cache.clear();
}

module.exports = {
    get,
    set,
    remove,
    clear
};