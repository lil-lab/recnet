import { db } from "../../../utils/db/init";
import { collection, query, where, getDocs } from "firebase/firestore";

/** [GET] Get user by email
 * req.query requires:
 * @param email
 * @returns user
 */
export default async function getUserByEmailHandler(req, res) {
  try {
    const { email } = req.query;
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // No user found with the provided email
      res.status(200).json(undefined);
    } else {
      const userId = querySnapshot.docs[0].id;
      res.status(200).json({ ...querySnapshot.docs[0].data(), id: userId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
