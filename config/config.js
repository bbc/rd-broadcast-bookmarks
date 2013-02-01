// config
module.exports = {
  PORT: process.env.PORT || 3000,
  MIN_DATE : Date.parse("2013-01-26T00:00:00Z"),
  MAX_DATE : Date.parse("2013-02-02T00:00:00Z") // date param must be < MAX_DATE
  };
