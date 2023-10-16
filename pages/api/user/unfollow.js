import { db } from "../../../utils/db/init";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";

/** [POST] Unfollow user by id
 * req.body requires:
 * @param id user to unfollow
 * @param currentUserId
 * @returns user
 */
export default async function followUserHandler(req, res) {
  try {
    const { id, currentUserId } = req.body;
    if (!id || !currentUserId) {
      res.status(500).json({ message: "Empty user id" });
    } else {
      // remove from [id] user followers
      await updateDoc(doc(db, "users", id), {
        followers: arrayRemove(currentUserId),
      });

      // remove from current user following
      await updateDoc(doc(db, "users", currentUserId), {
        following: arrayRemove(id),
      });

      res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}
