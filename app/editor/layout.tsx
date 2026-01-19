export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-black">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
