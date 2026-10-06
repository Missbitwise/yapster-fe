import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Yapster - Real-Time Chat & Nearby Discovery",
  description:
    "A sleek real-time chat application with location-based nearby friends discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-brand selection:text-white">
        <AuthProvider>
          <WebSocketProvider>
            <ToastProvider>{children}</ToastProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
