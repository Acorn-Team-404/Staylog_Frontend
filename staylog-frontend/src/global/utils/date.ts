/**
 *  날짜 문자열 한국시간 기준으로 표시하는 유틸 함수임
 * 
 */
export function formatKST(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr; // 혹시 파싱 실패하면 원문 표시

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}