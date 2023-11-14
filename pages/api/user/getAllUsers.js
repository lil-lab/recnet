import { db } from "../../../utils/db/init";
import { collection, query, getDocs } from "firebase/firestore";

/** [GET] Get all users */
export default async function getAllUsersHandler(req, res) {
  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      res.status(200).json([]);
    } else {
      const users = querySnapshot.docs.map((user) => {
        return { ...user.data(), id: user.id };
      });
      res.status(200).json(users);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
