type Props = { className?: string };

/** Swap this mark when the product is renamed. */
export function Logo({ className = "h-9 w-9" }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#141418" />
      <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="8.4" fill="none" stroke="#3DFF8F" strokeOpacity="0.75" />
      <path
        fill="#F4F4F5"
        d="M8.2 11.2h10.4c1.35 0 2.25.86 2.25 2.12v3.7c0 1.26-.9 2.12-2.25 2.12H13.2l-2.9 2.35v-2.35H8.2c-1.35 0-2.25-.86-2.25-2.12v-3.7c0-1.26.9-2.12 2.25-2.12Z"
      />
      <circle cx="23.1" cy="9.3" r="3.15" fill="#3DFF8F" />
      <circle cx="23.1" cy="9.3" r="1.15" fill="#06210f" />
    </svg>
  );
}
