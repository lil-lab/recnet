import { db } from "../../../utils/db/firebase-admin";

/** [GET] Get user by email (google account email)
 * req.query requires:
 * @param email
 * @returns user
 */
export default async function getUserByEmailHandler(req, res) {
  try {
    const { email } = req.query;
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (querySnapshot.empty) {
      // No user found with the provided email
      res.status(200).json(undefined);
    } else {
      const userId = querySnapshot.docs[0].id;
      res.status(200).json({ ...querySnapshot.docs[0].data(), id: userId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
