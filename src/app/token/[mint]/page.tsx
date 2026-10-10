import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TokenView } from "@/components/token/TokenView";
import { ErrorState } from "@/components/ui/States";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { PumpFunError } from "@/lib/pumpfun/normalize";
import { getToken } from "@/lib/pumpfun/service";
import { isBookmarked, listPosts, recordLookup } from "@/lib/social/service";
import { isMintAddress } from "@/lib/validators";

export async function generateMetadata({ params }: { params: Promise<{ mint: string }> }): Promise<Metadata> {
  const { mint } = await params;
  return { title: `Token ${mint.slice(0, 4)}…` };
}

export default async function TokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ mint: string }>;
  searchParams: Promise<{ refresh?: string }>;
}) {
  const { mint } = await params;
  const { refresh } = await searchParams;
  if (!isMintAddress(mint)) notFound();
  const user = await getCurrentUser();
  try {
    const token = await getToken(mint, refresh === "1");
    await recordLookup(user?.id ?? null, token);
    const [bookmarked, posts, linked] = await Promise.all([
      isBookmarked(user?.id ?? null, "token", token.mint),
      listPosts({ mint: token.mint, viewerId: user?.id ?? null, limit: 8 }),
      token.creator
        ? prisma.user.findFirst({
            where: { walletAddress: token.creator },
            select: { id: true, displayName: true, username: true },
          })
        : Promise.resolve(null),
    ]);
    return (
      <TokenView
        token={token}
        bookmarked={bookmarked}
        posts={posts.posts}
        showMarketData={user?.showMarketData !== false}
        linkedMember={linked}
      />
    );
  } catch (error) {
    if (error instanceof PumpFunError && error.code === "not_found") {
      return (
        <ErrorState
          title="No coin for that mint"
          body="coins-v2 did not find a Pump.fun coin at this address. Check the mint, or open it later if the coin was just created."
        />
      );
    }
    if (error instanceof PumpFunError) {
      return <ErrorState title="Pump.fun is unavailable" body={error.message} />;
    }
    throw error;
  }
}
