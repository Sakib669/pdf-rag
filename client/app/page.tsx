// src/app/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import FileUploadComponent from "@/components/file-upload";
import ChatComponent from "@/components/chat";

export default function Home() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
        Please sign in to use the application.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background text-foreground">
      <div className="w-[30vw] min-h-full p-6 border-r border-border">
        <FileUploadComponent />
      </div>
      <div className="flex-1 h-full">
        <ChatComponent />
      </div>
    </div>
  );
}
