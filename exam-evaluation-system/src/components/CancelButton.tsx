import React from "react";
import { X, ArrowLeft, Ban } from "lucide-react";
import CustomButton from "./CustomButton";

interface CancelButtonProps {
  text?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  iconType?: "x" | "arrow-left" | "ban";
  className?: string;
  type?: "button" | "submit" | "reset";
}

const CancelButton: React.FC<CancelButtonProps> = ({
  text = "Cancel",
  onClick,
  disabled = false,
  variant = "outline",
  size = "lg",
  showIcon = true,
  iconType = "x",
  className = "",
  type = "button",
}) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (iconType) {
      case "x":
        return <X className="w-4 h-4" />;
      case "arrow-left":
        return <ArrowLeft className="w-4 h-4" />;
      case "ban":
        return <Ban className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <CustomButton
      type={type}
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      icon={getIcon()}
      iconPosition="left"
    >
      {text}
    </CustomButton>
  );
};

export default CancelButton;