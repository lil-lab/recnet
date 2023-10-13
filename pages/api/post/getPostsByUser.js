import { db } from "../../../utils/db/init";
import { getDocs, query, collection, where } from "firebase/firestore";

/** [GET] Get all posts by user.
 * req.query requires:
 * @param userId
 */
export default async function getPostByUserHandler(req, res) {
  try {
    const { userId } = req.query;

    const q = query(
      collection(db, "recommendations"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    let recommendations = [];
    querySnapshot.forEach((doc) => {
      recommendations.push({ ...doc.data(), id: doc.id });
    });

    res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
