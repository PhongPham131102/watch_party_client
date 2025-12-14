import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8888";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  private constructor() {
    // Private constructor để đảm bảo singleton
  }

  // Lấy instance duy nhất
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Kết nối socket
  public connect(): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners();
  }

  // Ngắt kết nối
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("Socket disconnected");
    }
  }

  // Lắng nghe các sự kiện cơ bản
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
    });
  }

  // Gửi event
  public emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }

  // Lắng nghe event
  public on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Hủy lắng nghe event
  public off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Lắng nghe event một lần
  public once(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }

  // Kiểm tra trạng thái kết nối
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Lấy socket instance (để sử dụng các tính năng nâng cao)
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
