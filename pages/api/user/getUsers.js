import { db } from "../../../utils/db/init";
import { doc, getDoc } from "firebase/firestore";

/** [POST] Get user objects from a list of userIds
 * req.body requires:
 * @param userIds
 * @returns a list of user objects
 */
export default async function getUsersHandler(req, res) {
  try {
    const { userIds } = req.body;
    let users = [];

    for (let userId of userIds) {
      const docSnap = await getDoc(doc(db, "users", userId));

      if (docSnap.exists()) {
        users.push({ ...docSnap.data(), id: docSnap.id });
      }
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
