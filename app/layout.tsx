import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import { SuppressHydrationWarning } from '@/components/suppressHydrationWarning';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArticuLITE",
  description: "Web-based adaptation of the Articulate board game with AI-powered question generation",
};

// This special component helps suppress hydration warnings from browser extensions
function BrowserExtensionSuppressor() {
  return (
    <Script id="browser-extension-suppressor" strategy="beforeInteractive">
      {`
        (function() {
          // This script runs before React hydration
          // It will remove any attributes added by browser extensions like Grammarly
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-gr-')) {
                const node = mutation.target;
                node.removeAttribute(mutation.attributeName);
              }
            });
          });
          
          // Start observing the body and its descendants for attribute changes
          observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['data-gr-ext-installed', 'data-new-gr-c-s-check-loaded'],
            subtree: true 
          });
        })();
      `}
    </Script>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <BrowserExtensionSuppressor />
        </head>
        <SuppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </body>
        </SuppressHydrationWarning>
      </html>
    </ClerkProvider>
  );
}
