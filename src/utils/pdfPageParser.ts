/**
 * Lightweight helper to parse and validate user page range selection strings.
 * Has zero external dependencies and does not import heavy PDF libraries.
 */
export function parsePageSelectionString(
  rawInput: string,
  totalPages: number
): { pages: number[]; groups: { label: string; pages: number[] }[] } {
  // Normalize Arabic-Indic digits (٠-٩) and Arabic comma (،)
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const normalized = rawInput
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .replace(/،/g, ',')
    .trim();

  if (!normalized) {
    throw new Error(
      `يرجى إدخال أرقام الصفحات المطلوبة (بين 1 و ${totalPages}).`
    );
  }

  const tokens = normalized
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error(
      `يرجى إدخال أرقام صفحات صالحة (المستند يحتوي على ${totalPages} صفحة).`
    );
  }

  const groups: { label: string; pages: number[] }[] = [];
  const seenPages = new Set<number>();
  const flatPages: number[] = [];

  for (const token of tokens) {
    if (token.includes('-')) {
      const parts = token.split('-').map((p) => p.trim());
      if (
        parts.length !== 2 ||
        !/^\d+$/.test(parts[0]) ||
        !/^\d+$/.test(parts[1])
      ) {
        throw new Error(
          `صيغة النطاق "${token}" غير صحيحة. استخدم صيغة مثل 1-3 أو 2, 5.`
        );
      }
      const start = Number(parts[0]);
      const end = Number(parts[1]);

      if (start > end) {
        throw new Error(
          `بداية النطاق (${start}) يجب ألا تكون أكبر من نهايته (${end}).`
        );
      }
      if (start < 1 || end > totalPages) {
        throw new Error(
          `النطاق ${start}-${end} خارج حدود المستند (1 إلى ${totalPages}).`
        );
      }

      const grpPages: number[] = [];
      for (let p = start; p <= end; p++) {
        grpPages.push(p);
        if (!seenPages.has(p)) {
          seenPages.add(p);
          flatPages.push(p);
        }
      }
      groups.push({ label: `${start}-${end}`, pages: grpPages });
    } else {
      if (!/^\d+$/.test(token)) {
        throw new Error(
          `رقم الصفحة "${token}" غير صالح. يرجى إدخال أرقام صحيحة فقط.`
        );
      }
      const pageNum = Number(token);
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(
          `رقم الصفحة ${pageNum} غير موجود في المستند (الصفحات من 1 إلى ${totalPages}).`
        );
      }
      if (!seenPages.has(pageNum)) {
        seenPages.add(pageNum);
        flatPages.push(pageNum);
      }
      groups.push({ label: `${pageNum}`, pages: [pageNum] });
    }
  }

  if (flatPages.length === 0) {
    throw new Error('لم يتم تحديد أي صفحات صالحة.');
  }

  return { pages: flatPages, groups };
}
