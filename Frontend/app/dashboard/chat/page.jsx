'use client';

import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Messagerie</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Discutez avec vos camarades et vos enseignants en temps réel.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
