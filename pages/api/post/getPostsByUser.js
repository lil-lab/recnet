import { db } from "../../../utils/db/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getNextCutoff } from "@/utils/dateHelper";

/** [GET] Get all posts by user.
 * req.query requires:
 * @param userId
 */
export default async function getPostByUserHandler(req, res) {
  try {
    const { userId, includeCurrentCutoff } = req.query;

    let querySnapshot;
    if (includeCurrentCutoff === "true") {
      // including upcoming post in current cutoff
      querySnapshot = await db
        .collection("recommendations")
        .where("userId", "==", userId)
        .orderBy("cutoff", "desc")
        .get();
    } else {
      querySnapshot = await db
        .collection("recommendations")
        .where("userId", "==", userId)
        .where("cutoff", "!=", Timestamp.fromMillis(getNextCutoff()))
        .orderBy("cutoff", "desc")
        .get();
    }

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
