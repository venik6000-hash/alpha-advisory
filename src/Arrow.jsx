export default function Arrow({ straight = false }) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={straight ? "M4 12h16m-6-6 6 6-6 6" : "M6 18 18 6M6 6h12v12"} />
    </svg>
  );
}
