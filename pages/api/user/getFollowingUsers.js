import { db } from "../../../utils/db/init";
import {
  getDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";

/** [GET] Get followers of user
 * req.query requires:
 * @param userId
 * @returns a list of follower user objects of the user
 */
export default async function getFollowingUsersHandler(req, res) {
  try {
    const { userId } = req.query;
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { following } = docSnap.data();
      const q = query(collection(db, "users"), where("uid", "in", following));
      const querySnapshot = await getDocs(q);
      let followingUsers = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        followingUsers.push(doc.data());
      });

      res.status(200).json(followingUsers);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
