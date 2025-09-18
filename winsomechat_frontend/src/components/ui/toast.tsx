import { Toast } from "flowbite-react";
import { useState } from "react";

interface ToastProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose?: () => void;
}

export const CustomToast = ({ type, message, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-3 rounded-lg p-4 shadow-md ${getBgColor()}`}
      role="alert"
    >
      <div className="flex-1 text-sm font-normal">{message}</div>
      <button
        onClick={handleClose}
        className="ml-4 rounded-lg bg-transparent p-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Close notification"
      >
        &#x2715;
      </button>
    </div>
  );
};
