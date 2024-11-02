package org.example;

import java.io.IOException;

public class Main {

    static final long RECORD_TIME = 15000;

    public static void main(String[] args) throws IOException {

        WebsocketServer server = new WebsocketServer();
        server.startServer();

//        final JavaSoundRecorder recorder = new JavaSoundRecorder();
//
//        Thread stopper = new Thread(new Runnable() {
//            public void run() {
//                try {
//                    Thread.sleep(RECORD_TIME);
//                } catch (InterruptedException ex) {
//                    ex.printStackTrace();
//                }
//                recorder.finish();
//            }
//        });
//
//        stopper.start();
//
//        recorder.start();

    }


}