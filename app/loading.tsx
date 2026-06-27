export default function LoadingPage() {
  return (
    <div
      role="status"
      aria-label="페이지를 불러오는 중"
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <div className="loading" aria-hidden="true" />
    </div>
  );
}
