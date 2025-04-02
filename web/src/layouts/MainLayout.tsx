"use client";

import { Outlet } from "react-router";
import { Toaster } from "@gitcoin/ui";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export const MainLayout = () => {
  return (
    <div style={{ height: "100vh" }} className="flex min-h-full flex-col">
      <Toaster />
      <Navbar />
      <main className="flex flex-1 flex-col px-20 pt-10">
        <div className="flex flex-1">
          <Sidebar />
          <div className="ml-8 flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
