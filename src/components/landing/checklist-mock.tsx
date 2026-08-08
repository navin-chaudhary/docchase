import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const docs = [
  { name: "PAN Card", status: "Uploaded", done: true },
  { name: "Aadhaar Card", status: "Uploaded", done: true },
  { name: "Bank Statement", status: "Uploaded", done: true },
  { name: "Form 16", status: "Missing", done: false },
  { name: "Investment Proof", status: "Missing", done: false },
  { name: "Previous ITR", status: "Missing", done: false },
];

export function ChecklistMock() {
  const done = docs.filter((d) => d.done).length;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-[#e5e9ef] bg-white shadow-[0_20px_50px_-28px_rgba(12,18,34,0.35)]">
        <div className="border-b border-[#eef1f5] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                ITR Filing Documents
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Rahul Shah · Due 15 Aug 2026
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-700">
              In progress
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {done} of {docs.length} completed
              </span>
              <span>{Math.round((done / docs.length) * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(done / docs.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="divide-y divide-[#eef1f5]">
          {docs.map((doc) => (
            <li
              key={doc.name}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full",
                    doc.done
                      ? "bg-teal-50 text-primary"
                      : "border border-dashed border-slate-300 text-transparent"
                  )}
                >
                  {doc.done ? <Check className="size-3.5" /> : null}
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {doc.name}
                </span>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  doc.done ? "text-teal-700" : "text-amber-700"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    doc.done ? "bg-teal-600" : "bg-amber-500"
                  )}
                />
                {doc.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
