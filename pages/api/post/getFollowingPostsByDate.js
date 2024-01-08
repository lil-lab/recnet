import { db } from "../../../utils/db/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/** [GET] Get following posts by user of a specific week.
 * req.query requires:
 * @param userId
 * @param cutoff cutoff date timestamp
 */
export default async function getFollowingPostsByDateHandler(req, res) {
  try {
    const { userId, cutoff } = req.query;

    const docRef = db.doc(`users/${userId}`);
    const docSnap = await docRef.get();
    const data = docSnap.data();
    let following = [];

    if (data) {
      following = data.following;
      // following.push(userId); // include self
      if (following.length === 0) {
        res.status(200).json([]);
        return;
      }
    } else {
      res.status(404).json("User not found");
      return;
    }

    // following users' posts at this cutoff
    const querySnapshot = await db
      .collection("recommendations")
      .where("userId", "in", following)
      .where("cutoff", "==", Timestamp.fromMillis(cutoff))
      .get();

    let recommendations = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    if (data.seed) {
      const Chance = require("chance");
      const chance = new Chance(data.seed);
      const shuffledRecommendations = shuffleArray(recommendations, chance);
      res.status(200).json(shuffledRecommendations);
    } else {
      res.status(200).json(recommendations);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

function shuffleArray(array, chance) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = chance.integer({ min: 0, max: i });
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
