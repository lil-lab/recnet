import { db } from "../../../utils/db/init";
import {
  setDoc,
  getDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";

/** [DELETE] Delete a post by id.
 * @param postId
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
          lastPosted: serverTimestamp(),
          postIds: arrayRemove(id),
        },
        { merge: true }
      );

      res.status(200).json(docSnap.data());

      // delete post
      await deleteDoc(docRef);
    } else {
      // docSnap.data() will be undefined in this case
      res.status(404).json("Post not found");
    }

    res.status(200).json();
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
