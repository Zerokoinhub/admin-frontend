import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "User Profile",
  description: "ZeroKoin admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Move favicon to <head> */}
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
          {/* Page content on the right */}
          <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            {children}
          </main>
      </body>
    </html>
  );
}
