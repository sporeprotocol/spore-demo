function customFetch(request, init) {
  return fetch(request, {
    ...init,
    next: {
      revalidate: false,
    },
  });
}

module.exports = exports = customFetch;
exports.fetch = customFetch;
