const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Smart Parking API listening on http://localhost:${PORT}`);
});

