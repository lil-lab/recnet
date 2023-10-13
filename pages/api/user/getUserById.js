import { db } from "../../../utils/db/init";
import { getDoc, doc } from "firebase/firestore";

/** [GET] Get user by id
 * req.query requires:
 * @param id userId
 * @returns user
 */
export default async function getUserByIdHandler(req, res) {
  try {
    const { id } = req.query;
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    res.status(200).json({ ...docSnap.data(), id });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
