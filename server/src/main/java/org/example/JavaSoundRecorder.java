package org.example;

import javax.sound.sampled.*;
import java.io.File;
import java.io.IOException;


public class JavaSoundRecorder {

    static final long RECORD_TIME = 60000;

    File wavFile = new File("RecordAudio.wav");

    AudioFileFormat.Type fileType = AudioFileFormat.Type.WAVE;

    TargetDataLine line;

    public AudioFormat getAudioFormat() {
        float sampleRate = 48000; // Use 48000 Hz as supported
        int sampleSizeInBits = 16; // Use 16 bits for S16_LE
        int channels = 2; // Stereo
        boolean signed = true; // S16_LE is signed
        boolean bigEndian = false; // S16_LE is little-endian
        AudioFormat format = new AudioFormat(sampleRate, sampleSizeInBits,
                channels, signed, bigEndian);
        return format;
    }

    void start() {
        try {
            AudioFormat format = getAudioFormat();
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
            Mixer mixer = AudioSystem.getMixer(AudioSystem.getMixerInfo()[6]);

            if (!AudioSystem.isLineSupported(info)) {
                System.out.println("Line not supported");
                System.exit(0);
            }
            line = (TargetDataLine) mixer.getLine(info);
            line.open(format);
            line.start();   // start capturing

            System.out.println("Start capturing...");

            AudioInputStream ais = new AudioInputStream(line);

            System.out.println("Start recording...");

            // start recording
            AudioSystem.write(ais, AudioFileFormat.Type.WAVE, wavFile);

        } catch (LineUnavailableException | IOException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Closes the target data line to finish capturing and recording
     */
    void finish() {
        line.stop();
        line.close();
        System.out.println("Finished");
    }
}
