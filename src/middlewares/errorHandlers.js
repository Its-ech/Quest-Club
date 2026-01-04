function notFound(req, res, next) {
  // اگر هیچ روتی match نشد، 404 برگردان
  return res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
}

function errorHandler(err, req, res, next) {
  // اگر خطا status داشت از همون استفاده می‌کنیم، در غیر اینصورت 500
  const status = err.status || 500;

  return res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = { notFound, errorHandler };
