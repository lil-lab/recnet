import { db } from "../../../utils/db/init";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

/** [POST] Follow user by id
 * req.body requires:
 * @param id user to follow
 * @param currentUserId
 * @returns user
 */
export default async function followUserHandler(req, res) {
  try {
    const { id, currentUserId } = req.body;
    if (!id || !currentUserId) {
      res.status(500).json({ message: "Empty user id" });
    } else {
      // add to [id] user followers
      await updateDoc(doc(db, "users", id), {
        followers: arrayUnion(currentUserId),
      });

      // add to current user following
      await updateDoc(doc(db, "users", currentUserId), {
        following: arrayUnion(id),
      });

      res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
