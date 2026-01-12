import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error("CRITICAL: NEXT_PUBLIC_SOCKET_URL is MISSING during build!");
}
type SocketNamespace = "base" | "chat" | "room";

class SocketService {
  private static instance: SocketService;
  private sockets: Map<SocketNamespace, Socket> = new Map();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Connect đến một namespace cụ thể
  public connect(namespace: SocketNamespace): Socket {
    const existingSocket = this.sockets.get(namespace);
    if (existingSocket?.connected) {
      console.log(`Socket already connected to ${namespace}`);
      return existingSocket;
    }

    // Map namespace name to path
    const namespacePath = namespace === "base" ? "/" : `/${namespace}`;
    const url = `${SOCKET_URL}${namespacePath}`;

    const socket = io(url, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners(socket, namespace);
    this.sockets.set(namespace, socket);

    return socket;
  }

  // Disconnect một namespace
  public disconnect(namespace: SocketNamespace): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
      console.log(`Socket disconnected from ${namespace}`);
    }
  }

  // Disconnect tất cả namespaces
  public disconnectAll(): void {
    this.sockets.forEach((socket, namespace) => {
      socket.disconnect();
      console.log(`Socket disconnected from ${namespace}`);
    });
    this.sockets.clear();
  }

  // Setup event listeners cho socket
  private setupEventListeners(
    socket: Socket,
    namespace: SocketNamespace
  ): void {
    socket.on("connect", () => {
      console.log(`✅ Socket connected to ${namespace}:`, socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log(`👋 Socket disconnected from ${namespace}:`, reason);
    });

    socket.on("connect_error", (error) => {
      console.error(`❌ Socket connection error (${namespace}):`, error);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(
        `🔄 Socket reconnected to ${namespace} after ${attemptNumber} attempts`
      );
    });
  }

  // Lấy socket của namespace cụ thể
  public getSocket(namespace: SocketNamespace): Socket | null {
    return this.sockets.get(namespace) || null;
  }

  // Emit event đến namespace cụ thể
  public emit(namespace: SocketNamespace, event: string, data?: unknown): void {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(
        `Socket not connected to ${namespace}. Cannot emit event: ${event}`
      );
    }
  }

  // Listen event từ namespace cụ thể
  public on(
    namespace: SocketNamespace,
    event: string,
    callback: (...args: unknown[]) => void
  ): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.on(event, callback);
    }
  }

  // Hủy listen event
  public off(
    namespace: SocketNamespace,
    event: string,
    callback?: (...args: unknown[]) => void
  ): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.off(event, callback);
    }
  }

  // Kiểm tra connection
  public isConnected(namespace: SocketNamespace): boolean {
    const socket = this.sockets.get(namespace);
    return socket?.connected === true;
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
