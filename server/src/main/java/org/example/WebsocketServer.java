package org.example;

import org.glassfish.tyrus.server.Server;

import javax.websocket.DeploymentException;
import java.util.Scanner;

public class WebsocketServer {

    Server server = new Server("localhost", 8080, "/java", WebSocketServerEndpoint.class);

    public void startServer(){
        try {
            server.start();
            System.out.println("[SERVER]: Server is up and running.....");
            System.out.println("[SERVER]: Press 't' to terminate server.....");
            Scanner scanner = new Scanner(System.in);
            String inp = scanner.nextLine();
            scanner.close();
            if (inp.equalsIgnoreCase("t")) {
                System.out.println("[SERVER]: Server successfully terminated.....");
                server.stop();
            } else {
                System.out.println("[SERVER]: Invalid input!!!!!");
            }
        } catch (DeploymentException e) {
            e.printStackTrace();
        }
    }
}
