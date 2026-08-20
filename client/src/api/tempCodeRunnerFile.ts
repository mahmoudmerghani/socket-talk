let path = "/conversations/:conversationId/messages";

path = resolvePathParams(path, {
    conversationId: 12,
});

console.log(path);

path = resolvePathQueries(path, {
    after: 12,
    before: 11,
});
console.log(path);