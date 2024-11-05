import { useEffect, useState } from "react";
import "./ExploreContainer.css";

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [scriptNode, setScriptNode] = useState<ScriptProcessorNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<Uint8Array>(new Uint8Array());

  // Connect to the WebSocket
  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/java/demoApp");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => {
          const int8Array = new Uint8Array(buffer);
          setAudioBuffer((prevBuffer) => {
            const newBuffer = new Uint8Array(prevBuffer.length + int8Array.length);
            newBuffer.set(prevBuffer);
            newBuffer.set(int8Array, prevBuffer.length);
            return newBuffer;
          });

          // Start audio playback if not already playing
          if (!isPlaying) {
            startAudioPlayback();
          }
        });
      } else {
        console.log("Text message from server:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      stopAudioPlayback(); // Stop playback when socket closes
    };

    setSocket(ws);
  };

  // Start audio playback
  const startAudioPlayback = () => {
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }

    if (audioContext && !isPlaying) {
      const scriptNode = audioContext.createScriptProcessor(512, 2, 2);
      setScriptNode(scriptNode);

      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const outputBuffer = audioProcessingEvent.outputBuffer;
        const leftChannel = outputBuffer.getChannelData(0);
        const rightChannel = outputBuffer.getChannelData(1);

        if (audioBuffer.length >= 1024) {
          const chunk = audioBuffer.subarray(0, 1024);
          const floatData = convert16BitToFloat32(chunk);
          leftChannel.set(floatData.subarray(0, 256));
          rightChannel.set(floatData.subarray(256));
          setAudioBuffer((prevBuffer) => prevBuffer.subarray(1024));
        } else {
          leftChannel.fill(0);
          rightChannel.fill(0);
        }
      };

      scriptNode.connect(audioContext.destination);
      setIsPlaying(true);
      console.log("Audio playback started");
    }
  };

  // Stop audio playback
  const stopAudioPlayback = () => {
    if (scriptNode) {
      scriptNode.disconnect();
      setScriptNode(null);
    }
    setIsPlaying(false);
    console.log("Audio playback stopped");
  };

  // Convert 16-bit PCM to Float32
  const convert16BitToFloat32 = (buffer: Uint8Array) => {
    const float32Array = new Float32Array(buffer.length / 2);
    for (let i = 0; i < buffer.length; i += 2) {
      const int16 = buffer[i] | (buffer[i + 1] << 8);
      float32Array[i / 2] = int16 / 0x7FFF; // Normalize to [-1, 1]
    }
    return float32Array;
  };

  // Handle connection and disconnection
  const handleConnection = () => {
    if (socket && isConnected) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      stopAudioPlayback();
    } else {
      connectWebSocket();
    }
  };

  // Handle audio streaming
  const handleAudioStream = () => {
    if (socket && isConnected) {
      if (!isPlaying) {
        setIsPlaying(true)
        console.log("Requesting audio stream from server...");
        socket.send("getAudio"); // Send terminate signal to the server
      } else {
        setIsPlaying(false)
        console.log("Sending terminate command to server...");
        socket.send("terminate"); // Request audio from the backend
        stopAudioPlayback();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close(); // Close the socket when the component unmounts
      }
      stopAudioPlayback(); // Stop playback on unmount
    };
  }, [socket]);

  return (
    <div id="container">
      <Button
        name={isConnected ? "Disconnect" : "Connect"}
        onClick={handleConnection}
      />
      {isConnected && (
        <div id="button-container">
          <Button
            name={isPlaying ? "Stop Audio" : "Start Audio"}
            onClick={handleAudioStream} 
          />
          <Button name="Get Video" />
        </div>
      )}
    </div>
  );
};

const Button: React.FC<{ name: string; onClick?: () => void }> = ({
  name,
  onClick,
}) => {
  return (
    <button id="button" onClick={onClick}>
      {name}
    </button>
  );
};

export default ExploreContainer;
