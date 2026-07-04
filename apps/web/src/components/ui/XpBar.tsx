import { ProgressBar } from "./ProgressBar";

interface XpBarProps {
  percent: number;
  label?: string;
}

export function XpBar({ percent, label }: XpBarProps) {
  return (
    <div>
      {label ? <div style={{ marginBottom: "0.25rem", fontSize: "0.875rem" }}>{label}</div> : null}
      <ProgressBar percent={percent} variant="xp" label={label ?? "XP progress"} />
    </div>
  );
}
