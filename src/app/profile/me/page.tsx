import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function MyProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile/me");
  redirect(`/profile/${user.id}`);
}
