const cron = require("node-cron");
const Content = require("../models/Content");

cron.schedule("*/5 * * * *", async () => {
  await Content.deleteMany({ expiresAt: { $lt: new Date() } });
});
