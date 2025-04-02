"use client";

import { Outlet } from "react-router";
import { Toaster } from "@gitcoin/ui";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <Navbar />
      <div className="flex flex-1 px-20 pb-2 pt-10">
        <Sidebar />
        <main className="ml-8 flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
