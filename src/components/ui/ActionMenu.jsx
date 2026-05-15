import { useEffect, useRef } from "react";
import { MoreHorizontal, MoreVertical } from "lucide-react";

export function ActionMenu({
  label,
  items,
  open,
  onToggle,
  onClose,
  widthClass = "w-56",
  buttonClassName = "",
  iconOrientation = "horizontal",
}) {
  const rootRef = useRef(null);
  const TriggerIcon = iconOrientation === "vertical" ? MoreVertical : MoreHorizontal;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [onClose, open]);

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onToggle?.(event);
        }}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle/60 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-brand-blue ${buttonClassName}`}
      >
        <TriggerIcon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-border-subtle/70 bg-white p-1.5 shadow-float ${widthClass}`}
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  item.onClick(event);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                  item.tone === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
