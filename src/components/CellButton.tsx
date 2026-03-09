"use client";

import clsx from "clsx";
import { memo } from "react";
import type { CellValue } from "@/lib/sudoku";

type Props = {
  value: CellValue;
  preset: boolean;
  highlighted: boolean;
  rowComplete: boolean;
  rowFlash: boolean;
  colComplete: boolean;
  colFlash: boolean;
  onClick: () => void;
};

const CellButtonComponent = ({ value, preset, highlighted, rowComplete, rowFlash, colComplete, colFlash, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "grid-cell",
        "font-semibold",
        highlighted && "cell-highlight",
        (rowComplete || colComplete) && "cell-row-complete",
        (rowFlash || colFlash) && "cell-row-flash",
        preset ? "bg-slate-100 text-slate-600" : "bg-candy-yellow/70 text-purple-900",
        "transition-transform hover:scale-[1.02]"
      )}
      aria-label={value ? `Cell value ${value}` : "Empty cell"}
      disabled={preset}
    >
      {value !== 0 ? value : ""}
    </button>
  );
};

export const CellButton = memo(CellButtonComponent);
