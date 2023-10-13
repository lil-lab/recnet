// import { db } from "../../../utils/db/init";
// import { collection, query, where, getDocs } from "firebase/firestore";

// /** [GET] Get user by email
//  * req.query requires:
//  * @param email
//  */
// const getUserId = async (req, res) => {
//   try {
//     const { email } = req.query;
//     const q = query(collection(db, "users"), where("email", "==", email));
//     const querySnapshot = await getDocs(q);
//     if (querySnapshot.empty) {
//       // No user found with the provided email
//       res.status(404).json({ error: "User not found" });
//     }
//     const userId = querySnapshot.docs[0].id;
//     res.status(200).json({ userId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(error);
//   }
// };

// export default getUserId;
