import type { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarColor: string;
  walletAddress: string | null;
  createdAt: string;
  reduceMotion?: boolean;
  compactFeed?: boolean;
  showMarketData?: boolean;
};

export function toPublicUser(user: User, includeSettings = false): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarColor: user.avatarColor,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt.toISOString(),
    ...(includeSettings
      ? {
          reduceMotion: user.reduceMotion,
          compactFeed: user.compactFeed,
          showMarketData: user.showMarketData,
        }
      : {}),
  };
}

export type PostAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
};

export type PostDTO = {
  id: string;
  body: string;
  mint: string | null;
  createdAt: string;
  author: PostAuthor;
  bookmarked: boolean;
  source: "callout-social";
};
