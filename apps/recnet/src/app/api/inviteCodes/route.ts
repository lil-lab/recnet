import { db } from "@/firebase/admin";
import { inviteCodeSchema } from "@/types/inviteCode";
import { UserSchema } from "@/types/user";
import { notEmpty } from "@/utils/notEmpty";

export async function GET() {
  try {
    // get all invite codes
    const inviteCodes = await db.collection("invite-codes").get();
    // gather all userIds
    const userIds = [
      ...inviteCodes.docs
        .map((inviteCode) => inviteCode.data().usedBy)
        .filter(notEmpty),
      ...inviteCodes.docs
        .map((inviteCode) => inviteCode.data().issuedTo)
        .filter(notEmpty),
    ];
    // get all users data
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const user = await db.collection("users").doc(userId).get();
        // parse user data
        const res = UserSchema.safeParse({
          ...user.data(),
          id: user.id,
        });
        if (res.success) {
          return res.data;
        }
        return null;
      })
    );

    // join users to invite codes
    const inviteCodesWithUsers = inviteCodes.docs
      .map((inviteCode) => {
        const inviteCodeData = inviteCode.data();
        const user = users.find((user) => user?.id === inviteCodeData.usedBy);
        const owner = users.find(
          (user) => user?.id === inviteCodeData.issuedTo
        );
        const res = inviteCodeSchema.safeParse({
          ...inviteCodeData,
          issuedTo: owner,
          usedBy: user,
        });
        if (res.success) {
          return res.data;
        }
        return null;
      })
      .filter(notEmpty);

    return Response.json({
      inviteCodes: inviteCodesWithUsers,
    });
  } catch (error) {
    return Response.json(null, {
      status: 500,
    });
  }
}
