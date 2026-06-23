export default function signInLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full min-h-screen items-center justify-center bg-white">
      {children}
    </main>
  );
}
