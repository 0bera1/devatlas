const LOCALE_TR: string = 'tr-TR';

/**
 * Ad ve soyadın ilk harflerinden oluşan, büyük harfli kısaltma (ör. Ayşe Yılmaz → AY).
 */
export function buildUserInitials(firstName: string, lastName: string): string {
  const f: string = firstName.trim();
  const l: string = lastName.trim();
  const a: string = (f.charAt(0) || '?').toLocaleUpperCase(LOCALE_TR);
  const b: string = (l.charAt(0) || '?').toLocaleUpperCase(LOCALE_TR);
  return `${a}${b}`;
}
