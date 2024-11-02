package org.example;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

@ServerEndpoint(value = "/demoApp")
public class WebSocketServerEndpoint {

    private JavaSoundRecorder recorder;

    @OnOpen
    public void onOpen (Session session) {
        try {
            session.getBasicRemote().sendText("session opened");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("[SERVER]: Handshake successful!!!!! - Connected!!!!! - Session ID: " + session.getId());
    }


    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("[SERVER]: Received message: " + message);

        if (message.equalsIgnoreCase("getAudio")) {
            if (recorder != null) {
                recorder.finish();
            }

            try {
                Thread.sleep(10); // Piccola pausa per assicurarsi che le risorse audio siano liberate
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            recorder = new JavaSoundRecorder(session);
            recorder.start();

        } else if (message.equalsIgnoreCase("terminate")) {
            System.out.println("[SERVER]: Terminating audio capture");
            if (recorder != null) {
                recorder.finish();
                recorder = null;
            }
        }
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        System.out.println("[SERVER]: Session " + session.getId() + " closed: " + closeReason.getReasonPhrase());
        if (recorder != null) {
            recorder.finish();
            recorder = null;
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.out.println("[ERROR]: Error on session " + session.getId() + ": " + throwable.getMessage());
        if (recorder != null) {
            recorder.finish();
            recorder = null;
        }
    }
}