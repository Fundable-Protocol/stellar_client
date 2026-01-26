"use client";
import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "",
        style: {
          background: "#1a1b1e",
          color: "#fff",
          border: "1px solid #7c3aed",
          padding: "16px",
        },
        success: {
          iconTheme: {
            primary: "#7c3aed",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};
