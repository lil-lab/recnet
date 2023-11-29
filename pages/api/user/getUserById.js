import { db } from "../../../utils/db/firebase-admin";

/** [GET] Get user by id
 * req.query requires:
 * @param id userId
 * @returns user
 */
export default async function getUserByIdHandler(req, res) {
  try {
    const { id } = req.query;
    const docRef = db.doc(`users/${id}`);
    const docSnap = await docRef.get();

    res.status(200).json({ ...docSnap.data(), id });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
