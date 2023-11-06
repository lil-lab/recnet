import { db } from "../../../utils/db/init";
import { getDoc, doc } from "firebase/firestore";

/** [GET] Get recommendation post by post id
 * req.query requires:
 * @param postId
 */
export default async function getPostByIdHandler(req, res) {
  try {
    const { postId } = req.query;
    const docRef = doc(db, "recommendations", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(200).json(docSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      res.status(404).json("Post not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
