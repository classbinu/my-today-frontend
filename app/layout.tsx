import "../styles/globals.css";
import "animate.css";

import { AppProvider } from "@/contexts/AppProvider";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/navigation/navbar/mainNav";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "정글피디아",
  description: "개발자 면접 준비는 정글피디아",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} container mx-auto`}>
        <AppProvider>
          <MainNav />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
