import { redirect } from "next/navigation";

import { cn } from "@recnet/recnet-web/utils/cn";

// Leave this page here, redirect to user-rec stats for now
// We would want to build admin main page in the future
export default function AdminPage() {
  redirect("/admin/stats/user-rec");

  return (
    <div className={cn("w-full", "flex", "justify-center")}>
      To be implemented...
    </div>
  );
}
