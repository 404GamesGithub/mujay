export ANDROID_SDK_ROOT=~/Android/Sdk
export ANDROID_HOME=~/Android/Sdk
export DESKTOP=1 && bun run build
bunx cap sync
# i dont want to get a codesigning thingy sooooo
# bunx cap build android
cd android && ./gradlew assembleDebug && cd ..