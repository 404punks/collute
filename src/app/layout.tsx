import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Shell } from "@/components/shell/Shell";
import { ToastProvider } from "@/components/ui/Toast";
import { brand } from "@/lib/brand";
import { currentDataMode, pumpStatus } from "@/lib/pumpfun/policy";
import { shellData } from "@/lib/social/service";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let data: Awaited<ReturnType<typeof shellData>> | null = null;
  let setupError = false;
  try {
    data = await shellData();
  } catch (error) {
    setupError = true;
    console.error("[callout] shell data failed", error instanceof Error ? error.message : "unknown");
  }

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${data?.user?.reduceMotion ? "reduce-motion" : ""}`}>
      <body>
        <ToastProvider>
          <Shell
            user={data?.user ?? null}
            unread={data?.unread ?? 0}
            members={data?.members ?? []}
            recentLookups={data?.recentLookups ?? []}
            status={data?.status ?? pumpStatus(currentDataMode())}
            notice={
              setupError
                ? "The app database could not be opened, so sign-in and posts are unavailable. Looking up a mint still uses the documented Pump.fun coin endpoint."
                : null
            }
          >
            {children}
          </Shell>
        </ToastProvider>
      </body>
    </html>
  );
}
