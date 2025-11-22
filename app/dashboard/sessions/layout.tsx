'use client';

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {children}
    </div>
  );
}