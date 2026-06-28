interface XpBarProps {
  percent: number;
  label?: string;
}

export function XpBar({ percent, label }: XpBarProps) {
  return (
    <div>
      {label ? <div style={{ marginBottom: "0.25rem", fontSize: "0.875rem" }}>{label}</div> : null}
      <div className="xp-bar" aria-label={label ?? "XP progress"}>
        <div className="xp-bar-fill" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  );
}
