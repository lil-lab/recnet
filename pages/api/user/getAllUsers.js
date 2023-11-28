import { db } from "../../../utils/db/firebase-admin";
import { withAuth } from "@/utils/db/middleware";

/** [GET] Get all users */
async function getAllUsersHandler(req, res) {
  try {
    const querySnapshot = await db.collection("users").get();
    if (querySnapshot.empty) {
      res.status(200).json([]);
    } else {
      const users = querySnapshot.docs
        .map((user) => {
          return { ...user.data(), id: user.id };
        })
        .filter((user) => user.username && !user.test) // filter out unregister users & test accounts
        .sort((a, b) => {
          // sort by last name
          let aLastName = a.displayName.split(" ");
          aLastName = aLastName[aLastName.length - 1].toLowerCase();
          let bLastName = b.displayName.split(" ");
          bLastName = bLastName[bLastName.length - 1].toLowerCase();

          return aLastName < bLastName ? -1 : aLastName > bLastName ? 1 : 0;
        });
      res.status(200).json(users);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

export default withAuth(getAllUsersHandler);
