const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

const Email = require("./emailTemplate.js");
const TempGroup = require("./tempEmails.js");
admin.initializeApp();
const db = admin.firestore();

/** Returns specific time for cuttoff.
 * @param {number} dueDay
 * @return {Date} timestamp
 */
function getLastCutoff(dueDay) {
  const currentDate = new Date();
  const currentDay = currentDate.getUTCDay();
  const daysSinceLastCutoff = 7 - ((dueDay + 7 - currentDay) % 7);
  logger.log(`days since last cutoff: ${daysSinceLastCutoff}`);
  currentDate.setUTCDate(currentDate.getUTCDate() - daysSinceLastCutoff);
  currentDate.setUTCHours(23, 59, 59, 999);
  return currentDate;
}

/** Format a given day in local timezone in the form of MM/DD/YYYY.
 * @param {Date} d Date object
 * @return {string} date string
 */
function formatDate(d) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // Months are 0-based
  const date = d.getDate();

  return `${month}/${date}/${year}`;
}

// every wednesday 00:00
exports.sendWeeklyDigest = onSchedule(
  "every wednesday 00:01",
  async (event) => {
    try {
      const doc = await db.collection("configs").doc("cutoff").get();
      let cutoff = null;

      if (doc.exists) {
        const DUE_DAY = doc.data()["dueDay"];
        cutoff = getLastCutoff(DUE_DAY);
        logger.log(`cutoff: ${cutoff}`);
      } else {
        logger.error("Get cutoff error.");
        return;
      }

      // map over users
      const userDocs = await db.collection("users").get();

      userDocs.forEach(async (userDoc) => {
        const userData = userDoc.data();

        if (!TempGroup.test.includes(userData["email"])) {
          return;
        }

        const following = userData["following"];

        const recDocs = await db
          .collection("recommendations")
          .where("userId", "in", following)
          .where("cutoff", "==", Timestamp.fromMillis(cutoff))
          .get();

        const recommendations = [];

        await Promise.all(
          recDocs.docs.map(async (recDoc) => {
            const data = recDoc.data();
            const recommenderDoc = await db
              .doc(`users/${data["userId"]}`)
              .get();
            let recommenderName;
            if (recommenderDoc.exists) {
              recommenderName = recommenderDoc.data()["displayName"];
            }
            recommendations.push({
              ...data,
              recommenderName: recommenderName,
            });
          })
        );

        const dateText = formatDate(cutoff);

        const digest = {
          to: userData["email"],
          message: {
            subject: `[Recnet] Your Weekly Digest for ${dateText}`,
            html: Email.formatHTML(recommendations),
          },
        };

        await db.collection("mails").add(digest);
      });
    } catch (error) {
      logger.error("Error:", error);
    }
  }
);
