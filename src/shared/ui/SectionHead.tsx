import { Link } from 'react-router-dom';

interface Props {
  pre?: string;
  title: string;
  accent: string;
  linkTo?: string;
  linkLabel?: string;
}

export function SectionHead({ pre, title, accent, linkTo, linkLabel }: Props) {
  return (
    <div className="section-head">
      <div className="left">
        {pre && <div className="pre">{pre}</div>}
        <h2>{title}<span className="o">{accent}</span></h2>
      </div>
      {linkTo && (
        <div className="right">
          <Link to={linkTo}>{linkLabel ?? 'Ver tudo →'}</Link>
        </div>
      )}
    </div>
  );
}
