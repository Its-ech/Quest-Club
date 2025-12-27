function notFound(req, res, next) {
  return res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  return res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = { notFound, errorHandler };
