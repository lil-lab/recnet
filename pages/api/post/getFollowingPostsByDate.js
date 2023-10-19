import { db } from "../../../utils/db/init";
import {
  getDocs,
  query,
  collection,
  where,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

/** [GET] Get following posts by user of a specific week.
 * req.query requires:
 * @param userId
 * @param cutoff cutoff date timestamp
 */
export default async function getFollowingPostsByDateHandler(req, res) {
  try {
    const { userId, cutoff } = req.query;

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    let following = [];
    if (data) {
      following = data.following;
      following.push(userId); // include self
    } else {
      res.status(404).json(res.status(404).json({ error: "User not found" }));
    }

    // following users' posts at this cutoff
    const q = query(
      collection(db, "recommendations"),
      where("userId", "in", following),
      where("cutoff", "==", Timestamp.fromMillis(cutoff))
    );

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
