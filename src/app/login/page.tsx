import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/validators";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  const next = safeNextPath((await searchParams).next);
  if (user) redirect(next);
  return <AuthForm mode="login" next={next} />;
}
