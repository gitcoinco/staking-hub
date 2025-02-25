"use client";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@gitcoin/ui";
import { Outlet } from "react-router";

export const MainLayout = () => {
  return (
    <div style={{ height: "100vh" }} className="flex min-h-full flex-col">
      <Toaster />
      <Navbar />
      <main className="flex flex-1 flex-col px-20 py-16">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 ml-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};