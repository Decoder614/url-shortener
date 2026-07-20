const urls = [];

function saveUrl(urlRecord) {
  urls.push(urlRecord);
  return urlRecord;
}

function findByShortCode(shortCode) {
  return urls.find((url) => url.shortCode === shortCode);
}

module.exports = {
  saveUrl,
  findByShortCode,
};
