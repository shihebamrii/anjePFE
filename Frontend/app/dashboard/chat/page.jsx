'use client'; // Interactive client components execution path

// Import reusable ChatInterface layout element handling Socket.io chat state
import ChatInterface from '@/components/chat/ChatInterface';

// Chat section page wrapper
export default function ChatPage() {
  return (
    // Outer wrap div with entry animation
    <div className="space-y-6 animate-fade-in">
      {/* Title section details */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Messagerie</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Discutez avec vos camarades et vos enseignants en temps réel.
        </p>
      </div>

      {/* Render active chat interface module */}
      <ChatInterface />
    </div>
  );
}
