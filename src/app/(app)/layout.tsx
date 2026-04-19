import { requireSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { AppNav } from "@/components/app-nav";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <>
      <AppHeader username={session.username!} />
      <AppNav role={session.role!} />
      <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
    </>
  );
}
