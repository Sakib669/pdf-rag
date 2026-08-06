import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'; // shadcn toast
import { Toaster } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'PDF RAG Chat',
  description: 'Enterprise‑grade RAG system with Gemini & Qdrant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
        <body className="h-full flex flex-col bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header with auth */}
            <header className="bg-card border-b border-border px-6 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-foreground">📄 DocQuery</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Show when="signed-out">
                  <SignInButton mode="modal" />
                  <SignUpButton mode="modal">
                    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm px-4 py-2 cursor-pointer hover:bg-[#5b3ce0] transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}