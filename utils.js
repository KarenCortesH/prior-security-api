const returnError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

const isEmptyObject = (obj = {}) => {
  return !Object.keys(obj || {}).length;
};

const getTokenFromHeaders = headers => {
  // obtengo el token del usuario
  const h = headers.authorization;

  if (!h) return null;

  const array = h.split(' ');

  if (array.length < 2) {
    return null;
  }

  const token = array[1];

  if (!token) return null;

  return token;
};

module.exports = {
  returnError,
  isEmptyObject,
  getTokenFromHeaders
};
