export function LMSLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="#3b82f6" />
      <text
        x="50"
        y="68"
        font-family="Arial"
        font-size="60"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
      >
        LMS
      </text>
    </svg>
  );
}
