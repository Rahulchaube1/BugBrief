import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "BugBrief — Turn messy bug reports into developer-ready issues",
  description: "Paste a bug description, error, or client message and get a reproducible, structured issue in seconds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
