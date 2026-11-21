// 구조화 데이터(JSON-LD)를 <script>로 넣는다. "<"는 이스케이프해 스크립트가 중간에 끊기지 않게 한다.
export function PageJsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
