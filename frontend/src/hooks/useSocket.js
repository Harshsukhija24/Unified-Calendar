import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    // Handle connection events
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};

export default useSocket;
