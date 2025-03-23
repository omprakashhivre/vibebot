import { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "AI Chatbot - Login",
  description: "Login or register to access your AI chatbot assistant",
};
export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">AI Chatbot</h1>
            <p className="mt-2 text-slate-400">
              Process audio, video, and documents to chat with your data
            </p>
          </div>
          <AuthForm />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AI Chatbot. All rights reserved.
      </footer>
    </div>
  );
}
