import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl border border-blue-600 hover:border-blue-700',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl border border-gray-600 hover:border-gray-700',
    outline: 'bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200',
    destructive: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl border border-red-600 hover:border-red-700',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl border border-green-600 hover:border-green-700'
  }

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs min-h-[28px]',
    sm: 'px-3 py-2 text-sm min-h-[32px]',
    md: 'px-4 py-2.5 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[44px]',
    xl: 'px-8 py-4 text-xl min-h-[52px]'
  }

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const focusClasses = {
    primary: 'focus-visible:ring-blue-500',
    secondary: 'focus-visible:ring-gray-500',
    outline: 'focus-visible:ring-gray-500',
    ghost: 'focus-visible:ring-gray-400',
    destructive: 'focus-visible:ring-red-500',
    success: 'focus-visible:ring-green-500'
  }

  const isDisabled = disabled || loading
  
  const baseClasses = `
    relative font-semibold transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    transform hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    inline-flex items-center justify-center gap-2
    ${fullWidth ? 'w-full' : ''}
  `

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )

  const renderIcon = () => {
    if (loading) return <LoadingSpinner />
    return icon
  }

  const renderContent = () => {
    if (loading && !children) return <LoadingSpinner />
    
    if (iconPosition === 'right') {
      return (
        <>
          {children}
          {(icon || loading) && renderIcon()}
        </>
      )
    }
    
    return (
      <>
        {(icon || loading) && renderIcon()}
        {children}
      </>
    )
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${focusClasses[variant]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
      
      {/* Shimmer effect on hover for gradient variants */}
      {(['primary', 'secondary', 'destructive', 'success'].includes(variant)) && (
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-inherit transition-opacity duration-200" />
      )}
    </button>
  )
}

export default Button