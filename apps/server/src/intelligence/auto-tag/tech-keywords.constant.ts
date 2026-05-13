/**
 * Heuristic tag çıkarımında taranan sabit teknoloji terimleri.
 * Tümü normalize formattadır (küçük harf, boşluksuz).
 *
 * Bu liste ileride veritabanına taşınabilir; şimdilik
 * deterministik ve hızlı eşleşme için kod içinde tutuluyor.
 */
export const TECH_KEYWORDS: readonly string[] = [
  // Backend frameworks
  'nestjs',
  'express',
  'fastify',
  'django',
  'flask',
  'spring',
  'rails',
  'laravel',
  // Frontend frameworks
  'react',
  'next.js',
  'nextjs',
  'vue',
  'angular',
  'svelte',
  // Languages
  'typescript',
  'javascript',
  'python',
  'java',
  'go',
  'rust',
  'kotlin',
  'php',
  // Databases
  'postgresql',
  'postgres',
  'mysql',
  'sqlite',
  'mongodb',
  'redis',
  'cassandra',
  'elasticsearch',
  // Infra & DevOps
  'docker',
  'kubernetes',
  'terraform',
  'ansible',
  'nginx',
  'rabbitmq',
  'kafka',
  // Protocols / patterns
  'websocket',
  'graphql',
  'grpc',
  'rest',
  'oauth',
  'jwt',
  // Cloud
  'aws',
  'gcp',
  'azure',
  's3',
  'lambda',
];

export const AUTO_TAG_MAX_TEXT_LENGTH = 20_000;
export const AUTO_TAG_MAX_TAG_COUNT = 12;
