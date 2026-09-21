import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css"; // หรือนำเข้า tailwind css ของคุณ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IRPC TIS Dashboard",
  description: "TIS Management and View System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
