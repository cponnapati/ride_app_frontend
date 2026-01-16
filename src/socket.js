import { io } from "socket.io-client";
import { session } from "./api";

let sharedSocket = null;

// ✅ Keep old function (other pages might use it)
export function connectSocket() {
  return io("http://localhost:4000", {
    auth: { token: session.token },
    transports: ["websocket"],
  });
}

// ✅ New shared socket (recommended)
export function getSocket() {
  if (sharedSocket) return sharedSocket;

  sharedSocket = io("http://localhost:4000", {
    auth: { token: session.token },
    transports: ["websocket"],
  });

  // Don't crash UI if token missing/expired
  sharedSocket.on("connect_error", () => {});

  return sharedSocket;
}

export function disconnectSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}
