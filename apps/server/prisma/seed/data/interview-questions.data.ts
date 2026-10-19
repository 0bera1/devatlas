import type { InterviewQuestionCategory } from '@prisma/client';

export interface SeedInterviewQuestionInput {
  readonly slug: string;
  readonly question: string;
  readonly questionEn: string | null;
  readonly answer: string;
  readonly answerEn: string | null;
  readonly category: InterviewQuestionCategory;
  readonly tags: readonly string[];
  readonly difficulty: string | null;
  readonly questionKey: string;
  readonly parentSlug: string | null;
}

/**
 * Örnek mülakat soruları. Ana sorular `parentSlug: null` ile, takip soruları ise ana sorunun slug'ı ile
 * tanımlanır. Cevaplar kısa tutulmuştur; ayrıntılı anlatım bağlı doküman ve diyagramlarda bulunur.
 */
export const seedInterviewQuestions: readonly SeedInterviewQuestionInput[] = [
  {
    slug: 'url-kisaltici-olcekleme',
    question: 'Bir URL kısaltıcı nasıl ölçeklenir?',
    questionEn: 'How would you scale a URL shortener?',
    answer:
      'Okuma yükü yazmadan çok fazladır; yönlendirmeler önbellekte (Redis) tutulur. Kısa kodlar bölünmüş bir ID üreticisiyle üretilir ve kayıtlar kodun ilk karakterlerine göre parçalanır (sharding). Yazma yolu kuyruk üzerinden asenkron yapılabilir.',
    answerEn:
      'Reads far outnumber writes, so redirects are cached in Redis. Short codes come from a distributed ID generator, and records are sharded by the code. Writes can go through a queue to smooth spikes.',
    category: 'ARCHITECTURE',
    tags: ['ölçekleme', 'önbellek', 'sharding'],
    difficulty: 'MEDIUM',
    questionKey: 'url-kisaltici-olcekleme',
    parentSlug: null,
  },
  {
    slug: 'url-kisaltici-cakisma',
    question: 'Kısa kod çakışmalarını nasıl önlersiniz?',
    questionEn: 'How do you prevent short code collisions?',
    answer:
      'Rastgele kodlar yerine benzersiz bir sayı üretilip Base62 ile kodlanır. Üretilen kod veritabanında benzersiz kısıtla korunur; çakışma durumunda yeniden deneme yapılır.',
    answerEn:
      'Instead of random codes, generate a unique number and encode it in Base62. A unique constraint in the database guards the code, and a collision triggers a retry.',
    category: 'BACKEND',
    tags: ['veritabanı', 'kimlik'],
    difficulty: 'HARD',
    questionKey: 'url-kisaltici-cakisma',
    parentSlug: 'url-kisaltici-olcekleme',
  },
  {
    slug: 'rest-sayfalama',
    question: 'REST API’de sayfalama nasıl tasarlanır?',
    questionEn: 'How do you design pagination in a REST API?',
    answer:
      'Büyük listelerde limit ve cursor parametreleri kullanılır; yanıtta bir sonraki sayfanın cursor değeri döndürülür. Sayfa boyutu üst sınırla korunur.',
    answerEn:
      'For large lists, use limit and cursor parameters and return the next cursor in the response. Cap the page size to protect the server.',
    category: 'BACKEND',
    tags: ['rest', 'sayfalama'],
    difficulty: 'EASY',
    questionKey: 'rest-sayfalama',
    parentSlug: null,
  },
  {
    slug: 'cursor-sayfalama-avantaji',
    question: 'Cursor tabanlı sayfalama neden offset’ten daha iyidir?',
    questionEn: 'Why is cursor pagination better than offset pagination?',
    answer:
      'Offset, atlanan satırları yine de tarar ve listeye yeni kayıt eklendiğinde sayfalar arasında tekrarlar veya boşluklar oluşur. Cursor, son görülen sıralama anahtarından devam eder.',
    answerEn:
      'Offset still scans skipped rows, and inserts shift pages, causing duplicates or gaps. A cursor resumes from the last seen sort key.',
    category: 'BACKEND',
    tags: ['rest', 'sayfalama', 'performans'],
    difficulty: 'MEDIUM',
    questionKey: 'cursor-sayfalama-avantaji',
    parentSlug: 'rest-sayfalama',
  },
  {
    slug: 'saga-vs-iki-asamali-commit',
    question: 'Dağıtık işlemlerde Saga ile iki aşamalı commit farkı nedir?',
    questionEn: 'What is the difference between a saga and two-phase commit in distributed transactions?',
    answer:
      'İki aşamalı commit tüm katılımcıları kilitler ve eşzamanlı çalışır; hata toleransı zayıftır. Saga, her adımı yerel bir işlem olarak çalıştırır ve hata durumunda telafi işlemleriyle geri alır.',
    answerEn:
      'Two-phase commit locks all participants and needs them to be available together. A saga runs each step as a local transaction and undoes earlier steps with compensations on failure.',
    category: 'ARCHITECTURE',
    tags: ['dağıtık-işlem', 'saga'],
    difficulty: 'HARD',
    questionKey: 'saga-vs-iki-asamali-commit',
    parentSlug: null,
  },
  {
    slug: 'saga-telafi-islemi',
    question: 'Saga’da telafi işlemi nasıl tasarlanır?',
    questionEn: 'How do you design compensating actions in a saga?',
    answer:
      'Her adımın tersini yapan bir telafi işlemi tanımlanır. Telafiler idempotent olmalıdır, çünkü tekrar çalışabilirler; geri alınamayan adımlar ise onay gerektiren bir akışa taşınır.',
    answerEn:
      'Each step gets a compensation that reverses it. Compensations must be idempotent because they may run again; steps that cannot be undone move to a manual approval flow.',
    category: 'ARCHITECTURE',
    tags: ['saga', 'idempotens'],
    difficulty: 'HARD',
    questionKey: 'saga-telafi-islemi',
    parentSlug: 'saga-vs-iki-asamali-commit',
  },
  {
    slug: 'tuketici-idempotens',
    question: 'Tüketici tarafında idempotens nasıl sağlanır?',
    questionEn: 'How do you achieve idempotency on the consumer side?',
    answer:
      'Her mesaj için benzersiz bir anahtar tutulur ve işlenmiş anahtarlar bir tabloda saklanır. Aynı anahtar tekrar geldiğinde işlem atlanır ya da sonucu yeniden döndürülür.',
    answerEn:
      'Store a unique key per message and record processed keys in a table. When the same key arrives again, skip the work or return the stored result.',
    category: 'BACKEND',
    tags: ['mesajlaşma', 'idempotens'],
    difficulty: 'EASY',
    questionKey: 'tuketici-idempotens',
    parentSlug: null,
  },
  {
    slug: 'islenmis-mesaj-saklama',
    question: 'Tekrarlanan mesajlar için anahtarlar ne kadar süre saklanmalı?',
    questionEn: 'How long should processed message keys be kept?',
    answer:
      'Saklama süresi, üreticinin en uzun yeniden deneme penceresi kadar olmalıdır. Süresi dolan anahtarlar periyodik bir işle temizlenir.',
    answerEn:
      'Keep keys at least as long as the producer’s longest retry window. A periodic job removes expired keys.',
    category: 'BACKEND',
    tags: ['mesajlaşma', 'veri-saklama'],
    difficulty: 'MEDIUM',
    questionKey: 'islenmis-mesaj-saklama',
    parentSlug: 'tuketici-idempotens',
  },
  {
    slug: 'okuma-agirlikli-onbellek',
    question: 'Okuma ağırlıklı bir sistemde hangi önbellek deseni seçilir?',
    questionEn: 'Which caching pattern fits a read-heavy system?',
    answer:
      'Cache-aside çoğu durumda iyi bir başlangıçtır: okuma önbellekte yoksa veritabanından alınır ve önbelleğe yazılır. Sık değişen veriler için kısa TTL ve yazma sonrası geçersizleştirme birlikte kullanılır.',
    answerEn:
      'Cache-aside is a good default: on a miss, read from the database and fill the cache. For frequently changing data, combine a short TTL with invalidation on write.',
    category: 'ARCHITECTURE',
    tags: ['önbellek', 'redis'],
    difficulty: 'MEDIUM',
    questionKey: 'okuma-agirlikli-onbellek',
    parentSlug: null,
  },
  {
    slug: 'onbellek-gecersizlestirme',
    question: 'Önbellek geçersizleştirme neden zordur?',
    questionEn: 'Why is cache invalidation hard?',
    answer:
      'Bir veri birden fazla anahtarda önbelleğe alınmış olabilir ve yazma ile geçersizleştirme arasında yarış durumları oluşabilir. Olay tabanlı geçersizleştirme ve kısa TTL bu riski azaltır.',
    answerEn:
      'A value may be cached under several keys, and races can occur between a write and its invalidation. Event-driven invalidation and short TTLs reduce the risk.',
    category: 'ARCHITECTURE',
    tags: ['önbellek'],
    difficulty: 'HARD',
    questionKey: 'onbellek-gecersizlestirme',
    parentSlug: 'okuma-agirlikli-onbellek',
  },
  {
    slug: 'jwt-yenileme-rotasyonu',
    question: 'JWT yenileme token’ı neden rotasyon ile saklanır?',
    questionEn: 'Why are refresh tokens rotated?',
    answer:
      'Her yenilemede eski token iptal edilip yeni bir token verilir. Böylece çalınan bir token kısa sürede geçersiz olur ve yeniden kullanım tespit edilebilir.',
    answerEn:
      'Each refresh revokes the old token and issues a new one. A stolen token then expires quickly, and reuse can be detected.',
    category: 'BACKEND',
    tags: ['kimlik-doğrulama', 'jwt'],
    difficulty: 'MEDIUM',
    questionKey: 'jwt-yenileme-rotasyonu',
    parentSlug: null,
  },
  {
    slug: 'yeniden-kullanim-tespiti',
    question: 'Yeniden kullanım tespiti ne işe yarar?',
    questionEn: 'What does reuse detection protect against?',
    answer:
      'İptal edilmiş bir token tekrar kullanılırsa bu, token’ın sızdığının işaretidir. Sistem o oturum ailesinin tamamını iptal eder ve kullanıcıyı yeniden giriş yapmaya zorlar.',
    answerEn:
      'If a revoked token is presented again, the token has probably leaked. The system revokes the whole session family and forces a new sign-in.',
    category: 'BACKEND',
    tags: ['kimlik-doğrulama', 'güvenlik'],
    difficulty: 'MEDIUM',
    questionKey: 'yeniden-kullanim-tespiti',
    parentSlug: 'jwt-yenileme-rotasyonu',
  },
  {
    slug: 'kafka-siralama-garantisi',
    question: 'Kafka’da sıralama garantisi nedir?',
    questionEn: 'What ordering guarantee does Kafka give?',
    answer:
      'Sıralama yalnızca bir partition içinde garanti edilir. Aynı anahtarlı mesajlar aynı partition’a yazıldığı için ilgili olayların sırası korunur.',
    answerEn:
      'Ordering is guaranteed only within a partition. Messages with the same key go to the same partition, which preserves the order of related events.',
    category: 'ARCHITECTURE',
    tags: ['kafka', 'mesajlaşma'],
    difficulty: 'EASY',
    questionKey: 'kafka-siralama-garantisi',
    parentSlug: null,
  },
  {
    slug: 'partition-sayisi-riski',
    question: 'Partition sayısını artırmanın riski nedir?',
    questionEn: 'What is the risk of increasing the number of partitions?',
    answer:
      'Anahtar-partition eşlemesi değişebilir, bu da aynı anahtarın sırasını bozabilir. Ayrıca tüketici başına düşen yük ve dosya tanıtıcı sayısı artar.',
    answerEn:
      'The key-to-partition mapping can change, which may break ordering for a key. It also increases per-consumer overhead and open file handles.',
    category: 'ARCHITECTURE',
    tags: ['kafka', 'ölçekleme'],
    difficulty: 'HARD',
    questionKey: 'partition-sayisi-riski',
    parentSlug: 'kafka-siralama-garantisi',
  },
  {
    slug: 'react-sunucu-istemci-durumu',
    question: 'React’te sunucu durumu ile istemci durumu nasıl ayrılır?',
    questionEn: 'How do you separate server state from client state in React?',
    answer:
      'Sunucudan gelen veri (liste, kayıt) bir veri çekme kütüphanesinde tutulur; önbellek, yeniden getirme ve yükleme durumu oradan yönetilir. Arayüze özgü durum (açık pencere, seçim) bileşen içinde ya da hafif bir store’da kalır.',
    answerEn:
      'Data from the server lives in a fetching library that handles caching, refetching and loading states. UI-only state, such as open panels or selection, stays in components or a small store.',
    category: 'FRONTEND',
    tags: ['react', 'durum-yönetimi'],
    difficulty: 'MEDIUM',
    questionKey: 'react-sunucu-istemci-durumu',
    parentSlug: null,
  },
  {
    slug: 'sorgu-onbellek-suresi',
    question: 'Veri çekme kütüphanesinde önbellek süresi nasıl seçilir?',
    questionEn: 'How do you choose a cache lifetime in a data-fetching library?',
    answer:
      'Verinin ne kadar sık değiştiği ve yanlış verinin ne kadar zarar verdiği belirleyici olur. Sık değişen veri için kısa, nadir değişen veri için uzun süre seçilir; kritik işlemlerden sonra ilgili sorgu açıkça geçersiz kılınır.',
    answerEn:
      'How often the data changes and how harmful stale data is decide the lifetime. Use short lifetimes for volatile data and long ones for stable data; invalidate related queries explicitly after critical writes.',
    category: 'FRONTEND',
    tags: ['react', 'önbellek'],
    difficulty: 'MEDIUM',
    questionKey: 'sorgu-onbellek-suresi',
    parentSlug: 'react-sunucu-istemci-durumu',
  },
  {
    slug: 'guvenli-dagitim-hatti',
    question: 'Bir CI/CD hattında dağıtımı güvenli yapmak için ne yaparsınız?',
    questionEn: 'What makes a CI/CD deployment pipeline safe?',
    answer:
      'Her değişiklik testlerden ve statik analizden geçer, artefakt bir kez derlenip her ortamda aynı imajla kullanılır. Dağıtım kademeli yapılır, sağlık kontrolleri başarısız olursa otomatik geri alma devreye girer.',
    answerEn:
      'Every change passes tests and static analysis, and the artifact is built once and promoted through environments. Rollouts are gradual, and failed health checks trigger an automatic rollback.',
    category: 'DEVOPS',
    tags: ['ci-cd', 'dağıtım'],
    difficulty: 'MEDIUM',
    questionKey: 'guvenli-dagitim-hatti',
    parentSlug: null,
  },
  {
    slug: 'canary-mavi-yesil-farki',
    question: 'Canary dağıtım ile mavi-yeşil dağıtım arasındaki fark nedir?',
    questionEn: 'What is the difference between canary and blue-green deployment?',
    answer:
      'Mavi-yeşil, iki eşit ortam arasında anlık geçiş yapar. Canary ise yeni sürümü önce trafiğin küçük bir bölümüne verir ve metrikler iyi giderse oranı kademeli artırır.',
    answerEn:
      'Blue-green switches all traffic at once between two identical environments. Canary sends a small share of traffic to the new version first and raises it as metrics stay healthy.',
    category: 'DEVOPS',
    tags: ['dağıtım', 'ci-cd'],
    difficulty: 'MEDIUM',
    questionKey: 'canary-mavi-yesil-farki',
    parentSlug: 'guvenli-dagitim-hatti',
  },
  {
    slug: 'indeks-ne-zaman-zarar-verir',
    question: 'Veritabanında indeks eklemek ne zaman zarar verir?',
    questionEn: 'When can adding an index hurt a database?',
    answer:
      'Yazma ağırlıklı tablolarda her indeks ekleme ve güncellemeyi yavaşlatır ve disk kullanır. Seçici olmayan kolonlara (az sayıda farklı değer) açılan indeksler de sorguya fayda sağlamaz.',
    answerEn:
      'On write-heavy tables every index slows inserts and updates and uses disk. An index on a low-selectivity column rarely helps queries.',
    category: 'BACKEND',
    tags: ['veritabanı', 'indeks', 'performans'],
    difficulty: 'HARD',
    questionKey: 'indeks-ne-zaman-zarar-verir',
    parentSlug: null,
  },
  {
    slug: 'bilesik-indeks-kolon-sirasi',
    question: 'Bileşik indekste kolon sırası neden önemlidir?',
    questionEn: 'Why does column order matter in a composite index?',
    answer:
      'İndeks önce ilk kolona göre sıralanır. Sorgu ilk kolonu filtrelemiyorsa indeks tam olarak kullanılamaz; eşitlik koşulları önce, aralık koşulları sonra yazılmalıdır.',
    answerEn:
      'An index is sorted by its first column. If a query does not filter on it, the index cannot be used fully; put equality conditions first and range conditions last.',
    category: 'BACKEND',
    tags: ['veritabanı', 'indeks'],
    difficulty: 'MEDIUM',
    questionKey: 'bilesik-indeks-kolon-sirasi',
    parentSlug: 'indeks-ne-zaman-zarar-verir',
  },
];
