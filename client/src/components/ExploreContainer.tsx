import { useState } from 'react';
import './ExploreContainer.css';


interface ContainerProps {
  name: string;
}



const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Stato per la connessione
 

  const connectWebSocket = () => {
     const ws = new WebSocket('ws://localhost:8080/java/demoApp'); // Sostituisci con il tuo endpoint WebSocket

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true); // Imposta la connessione come attiva
    };

    ws.onmessage = (event) => {
      console.log('Message from server: ', event.data);
      // Gestisci i messaggi ricevuti
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false); // Imposta la connessione come chiusa
    };

    setSocket(ws);
  };

  

  const handleConnection = () => {
    if(socket && isConnected){
      socket.close();
      setIsConnected(false)
    } else {
      connectWebSocket()
    }
  }

  return (
    <div id='container'>
    <Button name={isConnected ? 'disconnect' : 'connect'} onClick={handleConnection} />
    {isConnected && ( 
      <div id='button-container'>
        <Button name="Get Audio"  />
        <Button name="Get Video"  />
      </div>
    )}
  </div>
  );
};

const Button: React.FC<{ name: string; onClick?: () => void; }> = ({ name, onClick }) => {
  return (
    <button id='button' onClick={onClick}>
      {name}
    </button>
  );
};




export default ExploreContainer;
