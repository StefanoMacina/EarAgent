package org.example;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.videoio.VideoCapture;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);

//        WebsocketServer server = new WebsocketServer();
//        server.startServer();
        VideoCapture camera = new VideoCapture(0);
        if (!camera.isOpened()) {
            System.out.println("Error: Cannot open camera!");
        } else {
            System.out.println("Camera opened successfully!");
            Mat frame = new Mat();
            if (camera.read(frame)) {
                System.out.println("Frame captured! Size: " + frame.size());
            }
            camera.release();
        }

    }


}

