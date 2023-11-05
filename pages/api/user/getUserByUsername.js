import { db } from "../../../utils/db/init";
import { collection, query, where, getDocs } from "firebase/firestore";

/** [GET] Get user by username
 * req.query requires:
 * @param username
 * @returns user
 */
export default async function getUserByUsernameHandler(req, res) {
  try {
    const { username } = req.query;
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // No user found with the provided username
      res.status(200).json(undefined);
      return;
    } else {
      res
        .status(200)
        .json({
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
