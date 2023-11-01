import { db } from "../../../utils/db/init";
import {
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";

/** [POST] Get user objects from a list of userIds
 * req.query requires:
 * @param userIds
 * @returns a list of user objects
 */
export default async function getUsersHandler(req, res) {
  try {
    const { userIds } = req.body;

    const q = query(collection(db, "users"), where("uid", "in", userIds));
    const querySnapshot = await getDocs(q);
    let users = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      users.push(doc.data());
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
