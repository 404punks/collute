import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Shell } from "@/components/shell/Shell";
import { ToastProvider } from "@/components/ui/Toast";
import { brand } from "@/lib/brand";
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
  } catch {
    setupError = true;
  }

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${data?.user?.reduceMotion ? "reduce-motion" : ""}`}>
      <body>
        <ToastProvider>
          {setupError || !data ? (
            <main className="mx-auto max-w-xl p-8">
              <h1 className="text-2xl font-semibold">Database is not ready</h1>
              <p className="mt-2 text-[var(--muted)]">
                Run <span className="mono">npx prisma migrate dev</span> and restart the app.
              </p>
            </main>
          ) : (
            <Shell
              user={data.user}
              unread={data.unread}
              members={data.members}
              recentLookups={data.recentLookups}
              status={data.status}
            >
              {children}
            </Shell>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
