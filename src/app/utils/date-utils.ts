// UI-only formatter utilities for date display
// Returns dates formatted as MM-DD-YYYY for display only (no mutation of stored data)
export function formatToMMDDYYYY(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const s = dateStr.trim();

  // 1) Numeric dd-mm-yyyy or dd/mm/yyyy
  const numericDMY = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (numericDMY) {
    const day = String(parseInt(numericDMY[1], 10)).padStart(2, '0');
    const month = String(parseInt(numericDMY[2], 10)).padStart(2, '0');
    const year = numericDMY[3];
    return `${month}-${day}-${year}`;
  }

  // 2) Match formats like '4th Feb 2026' or '4 Feb-2026' (handle ordinals)
  const dmMatch = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[-\/\s,]*(\w+)[-\/\s,]*(\d{4})$/i);
  if (dmMatch) {
    const dayPart = dmMatch[1];
    const monthPart = dmMatch[2];
    const yearPart = dmMatch[3];

    // Try numeric month
    const monthNum = parseInt(monthPart, 10);
    let mm = '';
    if (!isNaN(monthNum)) {
      mm = String(monthNum).padStart(2, '0');
    } else {
      // map textual month to number
      const m = monthPart.toLowerCase();
      const monthMap: { [key: string]: number } = {
        jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
        apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
        aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
        nov: 11, november: 11, dec: 12, december: 12
      };
      mm = monthMap[m] ? String(monthMap[m]).padStart(2, '0') : '00';
    }

    const dd = String(parseInt(dayPart, 10)).padStart(2, '0');
    return `${mm}-${dd}-${yearPart}`;
  }

  // 3) yyyy-mm-dd or yyyy/mm/dd
  const ymd = s.split(/[-\/]/);
  if (ymd.length === 3) {
    if (ymd[0].length === 4) {
      const yyyy = ymd[0];
      const mm = String(parseInt(ymd[1], 10)).padStart(2, '0');
      const dd = String(parseInt(ymd[2], 10)).padStart(2, '0');
      return `${mm}-${dd}-${yyyy}`;
    }
    if (ymd[2].length === 4) {
      // assuming dd-mm-yyyy
      const yyyy = ymd[2];
      const mm = String(parseInt(ymd[1], 10)).padStart(2, '0');
      const dd = String(parseInt(ymd[0], 10)).padStart(2, '0');
      return `${mm}-${dd}-${yyyy}`;
    }
  }

  // 4) Last resort: try Date parsing
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  // If all else fails, return original
  return dateStr;
}
