export function Avatar({
  name,
  color,
  large = false,
}: {
  name: string;
  color: string;
  large?: boolean;
}) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className={large ? "avatar lg" : "avatar"} style={{ background: color }} aria-hidden="true">
      {letter}
    </span>
  );
}
