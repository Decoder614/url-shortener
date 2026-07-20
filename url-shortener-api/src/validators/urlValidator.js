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

function isValidExpirationDate(value) {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.getTime() > Date.now();
}

module.exports = {
  isValidHttpUrl,
  isValidCustomAlias,
  isValidExpirationDate,
};
