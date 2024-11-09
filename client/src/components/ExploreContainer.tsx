import { useEffect, useState, useRef } from "react";
import "./ExploreContainer.css";

interface ContainerProps {
  name: string;
}

const BUFFER_SIZE = 512;
const MAX_BUFFER_SIZE = BUFFER_SIZE * 4;

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<number[]>([]);
  const isStreamRequested = useRef(false);

  const convert16BitToFloat32 = (buffer: number[]) => {
    const l = buffer.length;
    const output = new Float32Array(l / 2);
    for (let i = 0; i < l; i += 2) {
      const int16 = buffer[i] | (buffer[i + 1] << 8);
      output[i / 2] = int16 >= 0x8000 ? -(0x10000 - int16) / 0x8000 : int16 / 0x7FFF;
    }
    return output;
  };

  const setupAudioProcessor = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const scriptNode = audioContext.createScriptProcessor(BUFFER_SIZE, 0, 2);
    scriptNodeRef.current = scriptNode;

    scriptNode.onaudioprocess = (audioProcessingEvent) => {
      const outputBuffer = audioProcessingEvent.outputBuffer;
      const leftChannel = outputBuffer.getChannelData(0);
      const rightChannel = outputBuffer.getChannelData(1);

      const requiredSize = BUFFER_SIZE * 2 * 2;
      if (audioBufferRef.current.length >= requiredSize) {
        const chunk = audioBufferRef.current.splice(0, requiredSize);
        const floatData = convert16BitToFloat32(chunk);

        for (let i = 0; i < BUFFER_SIZE; i++) {
          leftChannel[i] = floatData[i * 2];
          rightChannel[i] = floatData[i * 2 + 1];
        }
      } else {
        leftChannel.fill(0);
        rightChannel.fill(0);
      }
    };

    scriptNode.connect(audioContext.destination);
  };

  const startAudioPlayback = async () => {
    if (isPlaying) return;

    try {
      setupAudioProcessor();

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsPlaying(true);
      console.log("Audio playback started");
    } catch (error) {
      console.error("Error starting audio playback:", error);
    }
  };

  const stopAudioPlayback = () => {
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;  // Clear the reference
    }
    setIsPlaying(false);
    audioBufferRef.current = [];
    console.log("Audio playback stopped");
  };

  async function connectWebSocket() {
    const ws = new WebSocket("wss://0b56-37-101-9-109.ngrok-free.app/java/demoApp");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };

    ws.onmessage = async (event) => {
      if (!isStreamRequested.current) return;
      
      if (event.data instanceof Blob) {
        try {
          const arrayBuffer = await event.data.arrayBuffer();
          const int8Array = new Uint8Array(arrayBuffer);
          
          audioBufferRef.current.push(...Array.from(int8Array));
          
          if (audioBufferRef.current.length > MAX_BUFFER_SIZE) {
            audioBufferRef.current = audioBufferRef.current.slice(-MAX_BUFFER_SIZE);
          }
        } catch (error) {
          console.error("Error handling audio data:", error);
        }
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
      stopAudioPlayback();
      isStreamRequested.current = false;
    };

    setSocket(ws);
  }

  const handleConnection = () => {
    if (socket && isConnected) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      stopAudioPlayback();
      isStreamRequested.current = false;
    } else {
      connectWebSocket();
    }
  };

  const handleAudioStream = async () => {
    if (!socket || !isConnected) return;

    if (!isPlaying) {
      await startAudioPlayback();
      isStreamRequested.current = true;
      socket.send("getAudio");
      console.log("Requesting audio stream from server...");
    } else {
      isStreamRequested.current = false;
      socket.send("terminate");
      stopAudioPlayback();
      console.log("Sending terminate command to server...");
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
      stopAudioPlayback();
      isStreamRequested.current = false;
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