import { siteConfig } from "@/config/site";
import { FiMenu, FiUser } from "react-icons/fi";

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = siteConfig.title,
  className = "",
}) => {
  return (
    <header
      className={`header p-4 shadow-sm mb-6 bg-black text-white ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side: Menu icon + title + description */}
        <div className="flex items-center space-x-6">
          <FiMenu className="text-white text-2xl" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            {siteConfig.description && (
              <p className="text-sm opacity-80 mt-1">
                {siteConfig.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Profile icon */}
        <FiUser className="text-white text-2xl" />
      </div>
    </header>
  );
};

export default Header;
