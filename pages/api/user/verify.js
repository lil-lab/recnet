import { db } from "../../../utils/db/init";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

/** [POST] Verify invite code and create user
 * req.body requires:
 * @param user
 * @param code
 * @returns db user object
 */
export default async function verifyCodeHandler(req, res) {
  try {
    const { user, code } = req.body;

    const ref = doc(db, "invite-codes", code);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // used invite code
      if (data["used"]) {
        res.status(409).json("This invite code has already been used.");
        return;
      }
      // valid code
      // create user, get user id
      const userData = {
        ...user,
        createdAt: serverTimestamp(),
        followers: [],
        following: [],
        inviteCode: code,
      };
      const { id: userId } = await addDoc(collection(db, "users"), userData);
      const userRef = doc(db, "users", userId);
      const additionalInfo = { seed: userId, id: userId };
      await setDoc(userRef, additionalInfo, { merge: true }); // add seed for sorting posts (same as id)

      // update invite code
      const newData = {
        ...data,
        used: true,
        usedAt: serverTimestamp(),
        usedBy: userId,
      };
      await setDoc(ref, newData, { merge: true });

      // return user data
      res.status(200).json({ ...userData, ...additionalInfo });
      return;
    } else {
      res.status(404).json("Invalid invite code.");
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
