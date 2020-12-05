const { HttpException } = require('../common/http-exception');

const handleErrors = (err, req, res, next) => {
  if (err instanceof HttpException) {
    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        stack: err.stack
      });
  }

  return res
    .status(500)
    .json({
      status: 500,
      message: err.message,
      stack: err.stack
    });
};

module.exports = handleErrors;
