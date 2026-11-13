import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "CSS Olympics | NIT Silchar Sports Platform",
  description:
    "Official Sports Tournament Administration and Real-time Match Center for Computer Science Society (CSS), NIT Silchar.",
  icons: {
    icon: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#020617] text-[#f8fafc] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
