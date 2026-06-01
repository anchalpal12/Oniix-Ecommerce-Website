import { useCountUp, useInView } from '../../hooks/useInView';
import ScrollReveal from '../ui/ScrollReveal';

const STATS = [
  { label: 'Active miners protected', value: 12000, suffix: '+' },
  { label: 'Underground sites deployed', value: 340, suffix: '+' },
  { label: 'Customer satisfaction', value: 98, suffix: '%' },
  { label: 'Countries shipped to', value: 28, suffix: '' },
];

function StatItem({ stat }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const count = useCountUp(stat.value, 2200, 0, inView);

  return (
    <div ref={ref} className="stat-item">
      <strong className="stat-number">
        {count.toLocaleString('en-IN')}{stat.suffix}
      </strong>
      <span className="stat-label">{stat.label}</span>
    </div>
  );
}

export default function StatsBar() {
  return (
    <ScrollReveal>
      <section className="stats-bar">
        <div className="container stats-grid-premium">
          {STATS.map((s) => (
            <StatItem key={s.label} stat={s} />
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
