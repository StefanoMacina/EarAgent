package org.example;

import javax.sound.sampled.*;
import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;

public class JavaSoundRecorder{

    private Session session;
    private volatile boolean running = false;
    private TargetDataLine line;
    private Thread recordingThread;

    public JavaSoundRecorder(Session session) {
        this.session = session;
    }

    public AudioFormat getAudioFormat() {
        float sampleRate = 48000;
        int sampleSizeInBits = 16;
        int channels = 2;
        boolean signed = true;
        boolean bigEndian = false;

        return new AudioFormat(sampleRate, sampleSizeInBits, channels, signed, bigEndian);
    }

    public void start(){
        if (running) {
            System.out.println("Recording is already in progress");
            return;
        }

        try {
            AudioFormat format = getAudioFormat();
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);

            // Verifica se la linea è disponibile prima di tentare di acquisirla
            if (line != null && line.isOpen()) {
                line.close();
            }

            Mixer mixer = AudioSystem.getMixer(AudioSystem.getMixerInfo()[6]);

            if (!AudioSystem.isLineSupported(info)) {
                System.out.println("Line not supported");
                return;
            }

            line = (TargetDataLine) mixer.getLine(info);
            line.open(format);
            line.start();
            running = true;

            System.out.println("[AUDIO]: Starting audio capture...");

            recordingThread = new Thread(() -> {
                byte[] buffer = new byte[1024];
                while (running) {
                    try {
                        int bytesRead = line.read(buffer, 0, buffer.length);
                        if (bytesRead > 0 && running) {
                            session.getBasicRemote().sendBinary(ByteBuffer.wrap(buffer, 0, bytesRead));
                        }
                    } catch (IOException e) {
                        System.out.println("[ERROR]: Error sending audio data: " + e.getMessage());
                        running = false;
                        break;
                    }
                }
                cleanup();
            });

            recordingThread.start();
        } catch (LineUnavailableException e) {
            System.out.println("[ERROR]: Could not start audio capture: " + e.getMessage());
            running = false;
        }
    }

    private void cleanup() {
        running = false;
        if (line != null) {
            line.stop();
            line.close();
            line = null;
            System.out.println("[AUDIO]: Audio capture stopped");
        }
    }

    void finish() {
        if (!running) {
            return;
        }

        running = false;

        if (recordingThread != null) {
            try {
                recordingThread.join(1000);
            } catch (InterruptedException e) {
                System.out.println("[ERROR]: Error while stopping recording thread: " + e.getMessage());
            }
            recordingThread = null;
        }

        cleanup();
    }
}

//public class JavaSoundRecorder {
//
//    File wavFile = new File("RecordAudio.wav");
//
//    AudioFileFormat.Type fileType = AudioFileFormat.Type.WAVE;
//
//    TargetDataLine line;
//
//    public AudioFormat getAudioFormat() {
//        float sampleRate = 48000; // Use 48000 Hz as supported
//        int sampleSizeInBits = 16; // Use 16 bits for S16_LE
//        int channels = 2; // Stereo
//        boolean signed = true; // S16_LE is signed
//        boolean bigEndian = false; // S16_LE is little-endian
//        AudioFormat format = new AudioFormat(sampleRate, sampleSizeInBits,
//                channels, signed, bigEndian);
//        return format;
//    }
//
//    void start() {
//        try {
//            AudioFormat format = getAudioFormat();
//            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
//            Mixer mixer = AudioSystem.getMixer(AudioSystem.getMixerInfo()[6]);
//
//            if (!AudioSystem.isLineSupported(info)) {
//                System.out.println("Line not supported");
//                System.exit(0);
//            }
//            line = (TargetDataLine) mixer.getLine(info);
//            line.open(format);
//            line.start();   // start capturing
//
//            System.out.println("Start capturing...");
//
//            AudioInputStream ais = new AudioInputStream(line);
//
//            System.out.println("Start recording...");
//
//            // start recording
//            AudioSystem.write(ais, AudioFileFormat.Type.WAVE, wavFile);
//
//        } catch (LineUnavailableException | IOException ex) {
//            ex.printStackTrace();
//        }
//    }
//
//    /**
//     * Closes the target data line to finish capturing and recording
//     */
//    void finish() {
//        line.stop();
//        line.close();
//        System.out.println("Finished");
//    }
//}
