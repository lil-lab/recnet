import { db } from "../../../utils/db/init";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/** [POST] Verify invite code for user
 * req.body requires:
 * @param userId
 * @param code
 * @returns a list of user objects
 */
export default async function verifyCodeHandler(req, res) {
  try {
    const { userId, code } = req.body;

    const ref = doc(db, "invite-codes", code);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newData = {
        ...data,
        used: true,
        usedAt: serverTimestamp(),
        usedBy: userId,
      };
      if (data["issuedTo"] === userId) {
        // update code
        await setDoc(ref, newData, { merge: true });
        // update user
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          await setDoc(
            userRef,
            {
              inviteCode: code,
            },
            { merge: true }
          );
          res.status(200).json(newData);
          return;
        } else {
          res.status(404).json("User not found.");
          return;
        }
      } else {
        // code is not issued to this user
        res.status(404).json("Invalid invite code.");
        return;
      }
    } else {
      res.status(404).json("Invalid invite code.");
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
