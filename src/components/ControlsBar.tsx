"use client";

const numbersBySize: Record<number, number[]> = {
  4: [1, 2, 3, 4, 0],
  5: [1, 2, 3, 4, 5, 0]
};

type Props = {
  onNumber: (value: number) => void;
  onHint: () => void;
  hintsLeft: number;
  disableInputs: boolean;
  size: 4 | 5;
};

export const ControlsBar = ({ onNumber, onHint, hintsLeft, disableInputs, size }: Props) => {
  const numberButtons = numbersBySize[size] ?? numbersBySize[4];
  return (
    <div className="pad-stack card">
      <div className="flex flex-col gap-2">
        {numberButtons.map((n) => (
          <button
            key={n}
            onClick={() => onNumber(n)}
            className="button-primary w-full text-2xl py-3 shadow-card"
            disabled={disableInputs}
          >
            {n === 0 ? "Erase" : n}
          </button>
        ))}
      </div>

      <button className="button-secondary w-full text-lg" onClick={onHint} disabled={disableInputs || hintsLeft <= 0}>
        Hint ({hintsLeft})
      </button>
    </div>
  );
};
