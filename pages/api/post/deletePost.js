import { db } from "../../../utils/db/init";
import {
  setDoc,
  getDoc,
  doc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";

/** [DELETE] Delete a post by id.
 * @param postId
 * @return deleted postId, userId
 */
export default async function deletePostHandler(req, res) {
  try {
    const { postId } = req.query;
    const docRef = doc(db, "recommendations", postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // delete from user postIds
      const { userId } = docSnap.data();
      const userRef = doc(db, "users", userId);

      await setDoc(
        userRef,
        {
          postIds: arrayRemove(postId),
        },
        { merge: true }
      );

      // delete post
      await deleteDoc(docRef);

      res.status(200).json({ postId, userId });
    } else {
      // post doens't exist
      res.status(404).json(`Post ${postId} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
