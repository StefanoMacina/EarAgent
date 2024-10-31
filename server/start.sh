# Compile the Java files
javac -d . src/main/java/org/example/*.java

# Create the JAR file
jar cfm EarAgent.jar Manifest.txt -C . org/example
