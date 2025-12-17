import { RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { RoomMessage, TypeMessage } from "@/src/types/room-message.types";

interface ChatTabProps {
  messages: RoomMessage[];
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  currentUserId?: string;
  chatMessage: string;
  sendingMessage: boolean;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  chatInputRef: RefObject<HTMLInputElement | null>;
  onChatMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function ChatTab({
  messages,
  hasMoreMessages,
  loadingMoreMessages,
  currentUserId,
  chatMessage,
  sendingMessage,
  scrollAreaRef,
  chatInputRef,
  onChatMessageChange,
  onSendMessage,
  onKeyPress,
}: ChatTabProps) {
  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="flex-1 max-h-[74vh] p-4">
        <div className="space-y-3">
          {/* Loading indicator at top */}
          {loadingMoreMessages && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Đang tải...</span>
              </div>
            </div>
          )}

          {/* No more messages indicator */}
          {!hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-white/30">Đã tải hết tin nhắn</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">Chưa có tin nhắn nào</p>
              <p className="text-white/30 text-xs mt-1">
                Hãy là người đầu tiên gửi tin nhắn!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const messageUser =
                typeof message.user === "object" && message.user
                  ? message.user
                  : null;
              const username = messageUser?.username || "Unknown";
              const userId = messageUser?.id;
              const messageTime = new Date(message.sentAt).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              // System message
              if (message.type === TypeMessage.SYSTEM) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <span className="text-xs text-white/40 text-center bg-white/5 px-3 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                );
              }

              // Check if message is from current user
              const isCurrentUser = userId === currentUserId;

              // Current user's message - align right
              if (isCurrentUser) {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/40">
                          {messageTime}
                        </span>
                        <span className="text-sm font-medium text-white">Bạn</span>
                      </div>
                      <div className="bg-primary/90 rounded-lg px-3 py-2">
                        <p className="text-sm text-white">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Other user's message - align left
              return (
                <div key={message.id} className="flex gap-2">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                      {username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[75%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {username}
                      </span>
                      <span className="text-xs text-white/40">{messageTime}</span>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2">
                      <p className="text-sm text-white/90">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            ref={chatInputRef}
            type="text"
            placeholder="Type a message..."
            value={chatMessage}
            onChange={(e) => onChatMessageChange(e.target.value)}
            onKeyDown={onKeyPress}
            disabled={sendingMessage}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={onSendMessage}
            disabled={sendingMessage || !chatMessage.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </>
  );
}
