"use client";

const placements = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrows = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-[#1A1A1A] border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1A1A1A] border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-[#1A1A1A] border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-[#1A1A1A] border-y-transparent border-l-transparent",
};

export function Tooltip({
  text,
  position = "top",
}: {
  text: string;
  position?: keyof typeof placements;
}) {
  return (
    <span
      role="tooltip"
      className={`absolute ${placements[position]} pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 px-3 py-1.5 bg-[#1A1A1A] text-[#F5E6D3] text-xs font-medium rounded-md shadow-lg max-w-[220px] text-center leading-tight`}
    >
      {text}
      <span
        aria-hidden="true"
        className={`absolute ${arrows[position]} border-4`}
      />
    </span>
  );
}
