import { siteConfig } from '@/config/site';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = siteConfig.title,
  className = '' 
}) => {
  return (
    <header className={`header p-4 rounded-lg shadow-sm mb-6 ${className}`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      {siteConfig.description && (
        <p className="text-sm opacity-80 mt-1">{siteConfig.description}</p>
      )}
    </header>
  )
}

export default Header