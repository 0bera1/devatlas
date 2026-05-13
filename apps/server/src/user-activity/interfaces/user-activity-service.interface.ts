import type { UserActivityEntry } from './user-activity-entry.interface';

export const USER_ACTIVITY_SERVICE: unique symbol = Symbol(
  'USER_ACTIVITY_SERVICE',
);

export interface IUserActivityService {
  /**
   * Bugünün UTC tarihine 1 aktivite ekler. Document/Diagram save action'larından
   * çağrılır. Hata fırlatmaz; çağıran iş akışını kesintiye uğratmamak için
   * arka planda günlük tutar.
   */
  recordActivity(userId: string): Promise<void>;

  /**
   * Profil heatmap'i için verilen tarih aralığındaki günlük aktivite kayıtları.
   * `to` exclusive değil; aralığı dahil eder (UTC).
   */
  getActivityInRange(
    userId: string,
    fromInclusive: Date,
    toInclusive: Date,
  ): Promise<UserActivityEntry[]>;
}
