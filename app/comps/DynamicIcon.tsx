import { icons } from "app/icons";
import React from "react";

// DynamicIcon Component
interface DynamicIconProps {
  iconName: any; // Nama ikon dari `icons`
  className?: string; // Class tambahan untuk styling
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, className }) => {
  if (!icons[iconName]) {
    console.error(`Icon "${iconName}" tidak ditemukan.`);
    return iconName;
  }

  return React.createElement(icons[iconName], { className });
};
