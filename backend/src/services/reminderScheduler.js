const cron = require("node-cron");
const Generation = require("../models/Generation");
const { sendCalendarReminderEmail } = require("./emailService");

async function runReminders() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const calendars = await Generation.find({
    type: "calendar",
    "output.scheduledDate": { $gte: todayStart, $lt: todayEnd },
  }).populate("userId", "email name");

  for (const generation of calendars) {
    if (!generation.userId?.email) continue;

    let changed = false;
    for (const item of generation.output) {
      const scheduledDate = new Date(item.scheduledDate);
      const isToday = scheduledDate >= todayStart && scheduledDate < todayEnd;
      if (!isToday || item.reminderSent) continue;

      try {
        await sendCalendarReminderEmail(generation.userId.email, item);
        item.reminderSent = true;
        changed = true;
      } catch (error) {
        console.error("Error enviando recordatorio de calendario:", error);
      }
    }

    if (changed) {
      generation.markModified("output");
      await generation.save();
    }
  }
}

function startReminderScheduler() {
  cron.schedule("0 8 * * *", runReminders, { timezone: "America/Bogota" });
}

module.exports = { startReminderScheduler, runReminders };
