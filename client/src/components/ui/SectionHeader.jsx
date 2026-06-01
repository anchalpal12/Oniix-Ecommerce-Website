export default function SectionHeader({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`section-header section-header--${align}`}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
