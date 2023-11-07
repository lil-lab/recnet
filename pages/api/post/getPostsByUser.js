import { db } from "../../../utils/db/init";
import {
  getDocs,
  query,
  collection,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { getNextCutoff } from "@/utils/dateHelper";

/** [GET] Get all posts by user.
 * req.query requires:
 * @param userId
 */
export default async function getPostByUserHandler(req, res) {
  try {
    const { userId, current } = req.query;

    let q;
    if (current === "true") {
      // including upcoming post in current cutoff
      q = query(
        collection(db, "recommendations"),
        where("userId", "==", userId),
        orderBy("cutoff", "desc")
      );
    } else {
      q = query(
        collection(db, "recommendations"),
        where("userId", "==", userId),
        where("cutoff", "!=", Timestamp.fromMillis(getNextCutoff())),
        orderBy("cutoff", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
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
