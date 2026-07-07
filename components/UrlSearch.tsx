"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

// ช่องค้นหาที่ sync ลง URL (?q=) — ใช้กับหน้า server component ได้เลย
export default function UrlSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [v, setV] = useState(sp.get("q") ?? "");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (v.trim()) params.set("q", v.trim());
      else params.delete("q");
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
    }, 300);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);

  return (
    <label className="relative">
      <Search
        size={13}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut"
      />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="w-52 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-brand"
      />
    </label>
  );
}
