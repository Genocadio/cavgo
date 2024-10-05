// app/layout.tsx or components/RootLayout.tsx
import type { Metadata } from "next";
import RootProvider from "@/app/RootProvider"; // Adjust the import path as needed
import 'react-toastify/dist/ReactToastify.css'; // Import the React Toastify CSS
import { ToastContainer } from 'react-toastify';
import Navbar from "./Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAVGO",
  description: "created by Geno Yves",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="cupcake" lang="en">
      <body>
        <RootProvider>
        {/* <Navbar /> */}
          {children}
          <ToastContainer /> {/* Add ToastContainer here */}
        </RootProvider>
      </body>
    </html>
  );
}
