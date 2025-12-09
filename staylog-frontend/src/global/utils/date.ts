/**
 *  날짜 문자열 한국시간 기준으로 표시하는 유틸 함수임
 *
 */
export function formatKST(dateStr?: string | null) {
  if (!dateStr) return "—";

  // ✅ 날짜만 있는 경우 (2025-12-19)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // ✅ 날짜+시간인데 ISO 문자열이 아닌 경우 → KST라고 가정하고 그냥 split
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16);
  }

  // ✅ ISO 형식은 정상적으로 parsing
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const pad = (n: number) => String(n).padStart(2, "0");

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

/**
 * Date 객체를 "YYYY-MM-DD" 형식의 문자열로 변환 (타임존 영향 없이 로컬 날짜 사용)
 *
 * ⚠️ 주의: toISOString()을 사용하면 UTC 시간대로 변환되어 날짜가 하루 밀리는 문제가 발생합니다.
 *
 * 예시:
 * - 한국시간(KST, UTC+9)으로 2025-12-24 00:00:00을 선택했을 때
 * - toISOString()은 "2025-12-23T15:00:00.000Z"를 반환 (UTC 기준)
 * - split('T')[0]하면 "2025-12-23"이 되어 하루 밀림
 *
 * 이 함수는 로컬 날짜 정보(getFullYear, getMonth, getDate)를 사용하여
 * 타임존 변환 없이 정확한 날짜를 반환합니다.
 *
 * @param date - 변환할 Date 객체 (null인 경우 빈 문자열 반환)
 * @returns "YYYY-MM-DD" 형식의 문자열 (예: "2025-12-24")
 */
export function formatDateToYYYYMMDD(date: Date | null): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatKSTDateOnly(dateStr?: string | null) {
  if (!dateStr) return "—";

  // 날짜만 있는 경우 그대로 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const d = new Date(dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return dateStr;

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());

  return `${yyyy}-${MM}-${dd}`;
}

