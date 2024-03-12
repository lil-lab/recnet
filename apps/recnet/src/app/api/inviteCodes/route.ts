import { db } from "@recnet/recnet-web/firebase/admin";
import { inviteCodeSchema } from "@recnet/recnet-web/types/inviteCode";
import { User, UserSchema } from "@recnet/recnet-web/types/user";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

export async function GET() {
  try {
    // get all invite codes
    const inviteCodes = await db.collection("invite-codes").get();
    // gather all userIds
    const userIds: string[] = [
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
    const usersMap: Record<string, User> = users
      .filter(notEmpty)
      .reduce((acc, user) => {
        return {
          ...acc,
          [user.id]: user,
        };
      }, {});

    // join users to invite codes
    const inviteCodesWithUsers = inviteCodes.docs
      .map((inviteCode) => {
        const inviteCodeData = inviteCode.data();
        const user = usersMap[inviteCodeData.usedBy];
        const owner = usersMap[inviteCodeData.issuedTo];
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
      inviteCodes: inviteCodesWithUsers.sort((a, b) => {
        // sort by usedAt
        if (a.usedAt && b.usedAt) {
          return b.usedAt._seconds - a.usedAt._seconds;
        }
        return (b.used ? 1 : 0) - (a.used ? 1 : 0);
      }),
    });
  } catch (error) {
    return Response.json(null, {
      status: 500,
    });
  }
}
