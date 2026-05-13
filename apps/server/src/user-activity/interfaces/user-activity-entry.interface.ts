/**
 * Heatmap için tek bir günü temsil eder. `bucketDate` UTC tarihinin yarıgece
 * timestamp'idir; istemci kendi local timezone'una çevirir.
 */
export interface UserActivityEntry {
  bucketDate: Date;
  count: number;
}
