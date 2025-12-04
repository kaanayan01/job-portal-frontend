import React from "react";
import Navbar from "./Navbar";// your existing global nav

export default function Layout({ Header, children }) {
  return (
    <>
      <Navbar /> {/* global bar on top — unchanged */}
      {Header ? <Header /> : null} {/* page-specific header */}
      <main className="main-container">
        {children}
      </main>
    </>
  );
}