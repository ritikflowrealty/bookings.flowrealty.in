import { ensureSchema, getDb } from '@/lib/db';
import { FAQAccordion } from './FAQAccordion';

type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export async function FAQSection({
  scope,
  scopeRefId,
  title = 'Frequently asked',
}: {
  scope: 'global' | 'location' | 'configuration' | 'budget' | 'project';
  scopeRefId?: number | null;
  title?: string;
}) {
  await ensureSchema();
  const sqlBase = `SELECT id, question, answer FROM faqs WHERE is_published = 1 AND scope = ?`;
  const args: (string | number)[] = [scope];
  let sql = sqlBase;
  if (scopeRefId) {
    sql += ' AND scope_ref_id = ?';
    args.push(scopeRefId);
  }
  sql += ' ORDER BY display_order, id';
  const r = await getDb().execute({ sql, args });
  const items = r.rows as unknown as FAQ[];
  if (items.length === 0) return null;

  return (
    <section className="py-12 lg:py-12">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">{title}</h2>
        <div className="mt-6">
          <FAQAccordion items={items} />
        </div>
      </div>
      {/* schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
