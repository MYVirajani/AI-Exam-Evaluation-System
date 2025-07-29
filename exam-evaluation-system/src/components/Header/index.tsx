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
      className={`relative overflow-hidden mb-6 ${className}`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-blue-600 to-cyan-400" />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute top-8 right-16 w-16 h-16 bg-white/3 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-4 left-1/3 w-20 h-20 bg-white/4 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Menu button with hover effect */}
            <button className="group relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110">
              <FiMenu className="text-white text-xl group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">
                {title}
              </h1>
              {siteConfig.description && (
                <p className="text-white/80 text-sm font-medium drop-shadow-sm">
                  {siteConfig.description}
                </p>
              )}
            </div>
          </div>

          {/* User profile button */}
          <button className="group relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110">
            <FiUser className="text-white text-xl" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Status indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </button>
        </div>
      </div>
      
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300" />
    </header>
  );
};

export default Header;