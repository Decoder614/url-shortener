function isValidHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
}

function isValidCustomAlias(value) {
  if (!value) {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  return /^[a-zA-Z0-9-]+$/.test(trimmedValue);
}

module.exports = {
  isValidHttpUrl,
  isValidCustomAlias,
};
