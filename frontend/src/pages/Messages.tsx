import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { getAllUsersForChat } from "../services/adminService";
import { UserProfile } from "../services/userService";

const API_URL = "/api";
const SOCKET_URL = "http://localhost:5000";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface ChatPreview {
  user: UserProfile;
  lastMessage: Message;
}

const Messages: React.FC = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current.emit("join", user.id);
    socketRef.current.on("receive_message", (msg: Message) => {
      if (
        activeChat &&
        ((msg.sender === user.id && msg.receiver === activeChat.id) ||
          (msg.sender === activeChat.id && msg.receiver === user.id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      fetchChats();
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [activeChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    const token = authService.getToken();
    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setChats([]);
        return;
      }
      const text = await res.text();
      if (!text) {
        setChats([]);
        return;
      }
      const data = JSON.parse(text);
      setChats(data);
    } catch (e) {
      setChats([]);
    }
  };

  const fetchMessages = async (chatUser: UserProfile) => {
    setLoading(true);
    setActiveChat(chatUser);
    const token = authService.getToken();
    const res = await fetch(`${API_URL}/messages/${chatUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeChat || !user) return;
    const msg = {
      sender: user.id,
      receiver: activeChat.id,
      content: input,
    };
    socketRef.current?.emit("send_message", msg);
    setInput("");
  };

  const fetchAllUsers = async () => {
    const token = authService.getToken();
    if (!token) return;
    const users = await getAllUsersForChat(token);
    setAllUsers(users.filter((u) => u.id !== user?.id));
  };

  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Лява лента */}
      <div className="w-1/3 border-r bg-gray-50 p-4 overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
          Чатове
          <button
            className="btn btn-secondary text-xs px-2 py-1 ml-2"
            onClick={() => {
              fetchAllUsers();
              setShowUserPicker(true);
            }}
          >
            + Нов чат
          </button>
        </h2>
        {chats.length === 0 && <div className="text-gray-500">Няма чатове</div>}
        <ul>
          {chats.map((chat, idx) =>
            chat.user && chat.user.id ? (
              <li
                key={chat.user.id || idx}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-all group border border-transparent hover:border-primary-300 shadow-sm hover:shadow-md bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 ${
                  activeChat && activeChat.id === chat.user.id
                    ? "border-primary-500 bg-primary-50 shadow-lg"
                    : ""
                }`}
                onClick={() =>
                  chat.user && chat.user.id && fetchMessages(chat.user)
                }
              >
                {/* Аватар с инициали */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shadow ${activeChat && activeChat.id === chat.user.id ? "bg-primary-500 text-white" : "bg-gray-300 text-primary-700 group-hover:bg-primary-400 group-hover:text-white"}`}
                >
                  {chat.user.name
                    ? chat.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">
                    {chat.user.name}
                  </div>
                  <div className="text-sm text-gray-600 truncate italic">
                    {chat.lastMessage.content}
                  </div>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs text-gray-400">
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                </div>
              </li>
            ) : null,
          )}
        </ul>
        {/* User Picker Modal */}
        {showUserPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-h-[70vh] overflow-y-auto relative">
              <h3 className="text-lg font-bold mb-4">Избери потребител</h3>
              <button
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => setShowUserPicker(false)}
                aria-label="Затвори"
              >
                ✕
              </button>
              <ul>
                {allUsers.length === 0 && (
                  <li className="text-gray-500">Няма други потребители</li>
                )}
                {allUsers.map((u) => (
                  <li
                    key={u.id}
                    className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setShowUserPicker(false);
                      setActiveChat(u);
                      fetchMessages(u);
                    }}
                  >
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* Основна част */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-primary-50 to-primary-100 flex items-center gap-3 shadow-sm">
          {activeChat ? (
            <>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 text-white font-bold text-lg shadow">
                {activeChat.name
                  ? activeChat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "?"}
              </div>
              <div className="font-bold text-lg">{activeChat.name}</div>
              <span className="ml-2 text-xs text-gray-400 bg-primary-100 px-2 py-1 rounded-full">
                {activeChat.email}
              </span>
            </>
          ) : (
            <div className="text-gray-500">Избери чат</div>
          )}
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-white to-primary-50 animate-fade-in">
          {loading ? (
            <div>Зареждане...</div>
          ) : (
            <div>
              {messages.map((msg, i) => (
                <div
                  key={msg._id}
                  className={`mb-2 flex ${msg.sender === user?.id ? "justify-end" : "justify-start"} animate-slide-up`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow text-sm relative transition-all duration-200 ${
                      msg.sender === user?.id
                        ? "bg-gradient-to-r from-primary-500 to-primary-400 text-white"
                        : "bg-white border border-primary-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-right text-gray-300 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {/* Малък триъгълник за балонче */}
                    <span
                      className={`absolute w-0 h-0 border-t-8 border-t-transparent ${msg.sender === user?.id ? "border-l-8 border-l-primary-500 right-[-16px] top-2" : "border-r-8 border-r-primary-100 left-[-16px] top-2"}`}
                    ></span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {activeChat && (
          <div className="p-4 border-t bg-gradient-to-r from-primary-50 to-primary-100 flex gap-2 items-center shadow-inner">
            <input
              className="input flex-1 text-base py-3 rounded-2xl border-2 border-primary-200 focus:border-primary-500 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Въведи съобщение..."
            />
            <button
              className="btn btn-primary px-6 py-3 rounded-2xl text-base shadow-md hover:scale-105 transition-transform"
              onClick={sendMessage}
            >
              <span role="img" aria-label="send">
                🚀
              </span>{" "}
              Изпрати
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
