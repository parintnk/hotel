import Assistant from "@/components/Assistant";
import Sidebar from "@/components/Sidebar";

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-60">{children}</div>
      <Assistant />
    </div>
  );
}
