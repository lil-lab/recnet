import { db } from "../../../utils/db/firebase-admin";

/** [GET] Get user by username
 * req.query requires:
 * @param username
 * @returns user
 */
export default async function getUserByUsernameHandler(req, res) {
  try {
    const { username } = req.query;

    const querySnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (querySnapshot.empty) {
      // No user found with the provided username
      res.status(200).json(undefined);
      return;
    } else {
      res.status(200).json({
        ...querySnapshot.docs[0].data(),
        id: querySnapshot.docs[0].id,
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
