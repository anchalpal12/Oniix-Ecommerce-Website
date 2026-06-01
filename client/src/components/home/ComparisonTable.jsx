import ScrollReveal from '../ui/ScrollReveal';

const ROWS = [
  { feature: 'Impact resistance', standard: 'Basic', onix: 'Polycarbonate ISO-rated' },
  { feature: 'Smart HUD alerts', standard: '✕', onix: '✓ Real-time' },
  { feature: 'Anti-fog coating', standard: 'Optional', onix: '✓ Standard' },
  { feature: 'Team comms integration', standard: '✕', onix: '✓ Built-in' },
  { feature: 'Warranty', standard: '6 months', onix: '2 years' },
];

export default function ComparisonTable() {
  return (
    <section className="section container">
      <ScrollReveal>
        <div className="comparison-wrap">
          <h2 className="section-title">Onix vs. standard safety glasses</h2>
          <div className="comparison-table">
            <div className="comparison-head">
              <span>Feature</span>
              <span>Standard</span>
              <span className="highlight-col">Onix</span>
            </div>
            {ROWS.map((r) => (
              <div key={r.feature} className="comparison-row">
                <span>{r.feature}</span>
                <span className="muted">{r.standard}</span>
                <span className="highlight-col"><strong>{r.onix}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
