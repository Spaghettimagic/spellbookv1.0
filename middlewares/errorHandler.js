export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
}
