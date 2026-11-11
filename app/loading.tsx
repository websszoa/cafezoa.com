export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-cream"
    >
      <div className="loader" />
      <span className="sr-only">불러오는 중</span>
    </main>
  );
}
