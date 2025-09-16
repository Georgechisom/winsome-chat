"use client";

import { ConnectKitButton } from "connectkit";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="hero-bg flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            Winsome Chat: Connect Seamlessly in a Decentralized World
          </h1>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mt-12">
            <ConnectKitButton />
          </div>
        </div>
      </section>
    </div>
  );
}
