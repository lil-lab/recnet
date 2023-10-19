import { db } from "../../../utils/db/init";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/** [POST] Add user to database.
 * req.body requires:
 * @param email
 * @returns user
 */
export default async function addUserHandler(req, res) {
  try {
    const data = {
      ...req.body,
      createdAt: serverTimestamp(),
      followers: [],
      following: [],
    };
    const { id } = await addDoc(collection(db, "users"), data);
    res.status(200).json({ ...data, id }); // NOTE: createdAt in the return data is not a valid timestamp: {"_methodName": "serverTimestamp"}
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
