import { io } from "socket.io-client";
import { session } from "./api";

export function connectSocket() {
  return io("http://localhost:4000", {
    auth: { token: session.token },
    transports: ["websocket"]
  });
}
