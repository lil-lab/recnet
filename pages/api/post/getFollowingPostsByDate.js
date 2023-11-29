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

    let recommendations = [];
    querySnapshot.forEach((doc) => {
      recommendations.push({ ...doc.data(), id: doc.id });
    });

    res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
