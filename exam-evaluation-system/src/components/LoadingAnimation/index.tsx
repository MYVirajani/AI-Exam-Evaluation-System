import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  color?: 'blue' | 'gray' | 'green' | 'red' | 'purple' | 'indigo';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg',
    xl: 'w-12 h-12 text-xl'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => (
    <FiLoader className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full bg-current ${
            size === 'sm' ? 'w-1.5 h-1.5' :
            size === 'md' ? 'w-2 h-2' :
            size === 'lg' ? 'w-2.5 h-2.5' :
            'w-3 h-3'
          } ${colorClasses[color]} animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`rounded-full bg-current ${sizeClasses[size]} ${colorClasses[color]} animate-pulse opacity-75`} />
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full bg-current ${
            size === 'sm' ? 'w-2 h-2' :
            size === 'md' ? 'w-3 h-3' :
            size === 'lg' ? 'w-4 h-4' :
            'w-5 h-5'
          } ${colorClasses[color]} animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  const renderWave = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`bg-current ${colorClasses[color]} ${
            size === 'sm' ? 'w-1 h-4' :
            size === 'md' ? 'w-1.5 h-6' :
            size === 'lg' ? 'w-2 h-8' :
            'w-2.5 h-10'
          }`}
          style={{
            animation: `wave 1.2s infinite ease-in-out`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );

  const renderAnimation = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bounce':
        return renderBounce();
      case 'wave':
        return renderWave();
      default:
        return renderSpinner();
    }
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center justify-center">
          {renderAnimation()}
        </div>
        {text && (
          <p className={`font-medium ${colorClasses[color]} ${textSizeClasses[size]} animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;