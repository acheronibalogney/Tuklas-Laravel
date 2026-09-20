import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '', compact = false }) {
  return <Link className={`field-wordmark ${className}`.trim()} to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>;
}
