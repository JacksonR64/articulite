import Image from "next/image";
import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";

export default function Home() {
  return (
    <ClientLayout>
      <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-[calc(100vh-76px)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-1 items-center sm:items-start">
          <h1 className="text-4xl font-bold mb-4">ArticuLITE</h1>
          <p className="text-xl mb-8">Web-based adaptation of the Articulate board game with AI-powered question generation</p>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              href="/setup"
            >
              Start Game
            </Link>
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
              href="https://www.drumondpark.co.uk/rules/articulate"
              target="_blank"
              rel="noopener noreferrer"
            >
              Game Rules
            </a>
          </div>
        </main>
        <footer className="row-start-2 flex gap-[24px] flex-wrap items-center justify-center">
          <Link
            href="/setup"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Play Game
          </Link>
          <Link
            href="/demo/openai"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <Image
              aria-hidden
              src="/brain.svg"
              alt="AI icon"
              width={16}
              height={16}
            />
            OpenAI Demo
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <Image
              aria-hidden
              src="/gear.svg"
              alt="Settings icon"
              width={16}
              height={16}
            />
            Settings
          </Link>
        </footer>
      </div>
    </ClientLayout>
  );
}
