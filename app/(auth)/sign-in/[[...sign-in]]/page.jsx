"use client";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full bg-white border border-slate-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
        
        {/* Left - Image / Illustration */}
        <div className="relative hidden md:flex items-center justify-center bg-white">
          <img
            src="https://readymadeui.com/login-image.webp"
            alt="Login visual"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right - Clerk Auth */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="space-y-6">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
