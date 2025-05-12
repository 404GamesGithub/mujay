export ANDROID_SDK_ROOT=~/Android/Sdk
export ANDROID_HOME=~/Android/Sdk
export DESKTOP=1 && bun run build
bunx cap sync
bunx cap run android