'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Send, Hash, Users, MessageSquare, User, Clock, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Socket should connect to the base URL (without /api)
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');

export default function ChatInterface() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const [roomSearch, setRoomSearch] = useState('');
  const scrollRef = useRef();

  // Initialize Socket
  useEffect(() => {
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on('user_typing', (data) => {
        if (data.userId !== user?._id) {
          setTyping(data.userName);
        }
      });

      newSocket.on('user_stop_typing', () => {
        setTyping(null);
      });

      return () => newSocket.close();
    }
  }, [token, user?._id]);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/chat/rooms');
        setRooms(res.data);
        if (res.data.length > 0) {
          joinRoom(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRooms();
  }, [token]);

  const joinRoom = async (room) => {
    // We update currentRoom state even if it's the same, to trigger UI refresh if needed
    // but we avoid re-joining the socket room if it's the same ID
    const isSameRoom = currentRoom?.id === room.id;
    
    if (socket && currentRoom && !isSameRoom) {
      socket.emit('leave_room', currentRoom.id);
    }

    setCurrentRoom(room);
    setMessages([]);
    
    // Fetch History
    try {
      const res = await api.get(`/chat/history/${room.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }

    if (socket && !isSameRoom) {
      socket.emit('join_room', room.id);
    }
    scrollToBottom();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentRoom) return;

    socket.emit('send_message', {
      room: currentRoom.id,
      content: newMessage,
    });
    setNewMessage('');
    socket.emit('stop_typing', { room: currentRoom.id });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && currentRoom) {
      if (e.target.value.length > 0) {
        socket.emit('typing', { room: currentRoom.id });
      } else {
        socket.emit('stop_typing', { room: currentRoom.id });
      }
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) return <div className="flex items-center justify-center h-full">Chargement...</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Sidebar - Rooms */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <MessageSquare size={20} className="text-primary" />
            Salons de discussion
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Rechercher un salon..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-sm rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {rooms.filter(room => room.name.toLowerCase().includes((roomSearch || '').toLowerCase())).map((room) => (
            <button
              key={room.id}
              onClick={() => joinRoom(room)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left",
                currentRoom?.id === room.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                currentRoom?.id === room.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
              )}>
                {room.type === 'GENERAL' ? <Hash size={18} /> : <Users size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{room.name}</p>
                <p className={cn(
                  "text-[10px] uppercase font-bold tracking-wider",
                  currentRoom?.id === room.id ? "text-white/70" : "text-slate-400"
                )}>
                  {room.type}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {currentRoom?.type === 'GENERAL' ? <Hash size={20} /> : <Users size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{currentRoom?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {typing ? `${typing} est en train d'écrire...` : 'En ligne'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
          {messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user._id;
            return (
              <div key={idx} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn("flex items-end gap-2 max-w-[80%]", isMe && "flex-row-reverse")}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0 border border-indigo-200 uppercase">
                      {msg.senderName?.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-tight">
                        {msg.senderName} • {msg.senderRole}
                      </span>
                    )}
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-[13.5px] shadow-sm leading-relaxed",
                      isMe 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700"
                    )}>
                      {msg.content}
                    </div>
                    <span className={cn("text-[9px] text-slate-400 mt-1 flex items-center gap-1", isMe ? "justify-end" : "justify-start")}>
                      <Clock size={8} />
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onBlur={() => socket?.emit('stop_typing', { room: currentRoom.id })}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary-dark transition-all duration-200 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
