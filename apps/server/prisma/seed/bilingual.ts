export function bilingualSection(
  enTitle: string,
  enBody: string,
  trTitle: string,
  trBody: string,
): string {
  return `## ${enTitle} (EN)

${enBody}

---

## ${trTitle} (TR)

${trBody}`;
}
