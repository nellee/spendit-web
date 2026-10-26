export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <header className="bg-primary py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-white text-2xl font-bold tracking-tight">
            Spendit
          </span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
