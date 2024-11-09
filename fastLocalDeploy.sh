#!/bin/bash
cd client
ionic build --prod
ionic cap add android
ionic capacitor copy android && ionic capacitor sync  &&  cd android && ./gradlew assembleDebug && cd ..
sudo rm  /var/www/html/*
sudo cp android/app/build/outputs/apk/debug/app-debug.apk /var/www/html/
