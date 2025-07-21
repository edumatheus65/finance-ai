import { ReactNode } from "react";

interface PercentageItemProps {
  icon: ReactNode;
  title: string;
  value: number;
}

const PercentageItem = ({ icon, title, value }: PercentageItemProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <div className="bg-muted rounded-lg p-1.5">{icon}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      <div className="text-xs font-bold">
        {isNaN(value) ? "0%" : `${value}`}%
      </div>
    </div>
  );
};

export default PercentageItem;
