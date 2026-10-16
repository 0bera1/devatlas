import { resolveCorsOrigins } from './cors-origins';

describe('resolveCorsOrigins', () => {
  it('CORS_ORIGIN değerini virgülle ayırıp boşlukları temizler', () => {
    expect(
      resolveCorsOrigins({
        CORS_ORIGIN: ' https://a.example.com , https://b.example.com ',
        NODE_ENV: 'production',
      }),
    ).toEqual(['https://a.example.com', 'https://b.example.com']);
  });

  it('geliştirmede CORS_ORIGIN yoksa yalnızca yerel web istemcisine izin verir', () => {
    expect(resolveCorsOrigins({ NODE_ENV: 'development' })).toEqual([
      'http://localhost:3000',
    ]);
  });

  it('üretimde CORS_ORIGIN yoksa açılışta hata verir', () => {
    expect(() => resolveCorsOrigins({ NODE_ENV: 'production' })).toThrow(
      'CORS_ORIGIN üretim ortamında zorunludur',
    );
  });

  it('boş CORS_ORIGIN üretimde de hata verir', () => {
    expect(() =>
      resolveCorsOrigins({ NODE_ENV: 'production', CORS_ORIGIN: ' , ' }),
    ).toThrow('CORS_ORIGIN üretim ortamında zorunludur');
  });
});
