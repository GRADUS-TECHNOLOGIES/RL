// Fail closed: do not create indexes at runtime. Provision separately after preflight.
export async function hasFirebaseUidIndex(User) {
    const indexes = await User.collection.indexes();
    return indexes.some(index => index.unique === true &&
        Object.keys(index.key || {}).length === 1 && index.key.firebaseUid === 1 &&
        JSON.stringify(index.partialFilterExpression) === JSON.stringify({ firebaseUid: { $type: 'string' } }) &&
        !index.sparse && !index.collation);
}
