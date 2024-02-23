function customFetch(request, init) {
  return fetch(request, {
    ...init,
    cache: 'no-store',
    next: {
      revalidate: 300,
    },
  });
}

module.exports = exports = customFetch;
exports.fetch = customFetch;
