import React from "react";
import { Play, RefreshCw } from "lucide-react";
import CustomButton from "./CustomButton";

interface AttemptButtonProps {
  text?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  iconType?: "play" | "refresh";
  className?: string;
  type?: "button" | "submit" | "reset";
}

const AttemptButton: React.FC<AttemptButtonProps> = ({
  text = "Start Quiz",
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "lg",
  showIcon = true,
  iconType = "play",
  className = "",
  type = "submit",
}) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (iconType) {
      case "play":
        return <Play className="w-4 h-4" />;
      case "refresh":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getLoadingText = () => {
    if (text.toLowerCase().includes("retry") || text.toLowerCase().includes("again")) {
      return "Retrying...";
    }
    if (text.toLowerCase().includes("verify")) {
      return "Verifying...";
    }
    return "Processing...";
  };

  return (
    <CustomButton
      type={type}
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      loading={loading}
      className={className}
      icon={getIcon()}
      iconPosition="left"
    >
      {loading ? getLoadingText() : text}
    </CustomButton>
  );
};

export default AttemptButton;