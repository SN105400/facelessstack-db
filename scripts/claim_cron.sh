#!/bin/bash
# LaunchAgent wrapper — runs the claim driver with ZERO LLM involvement.
# Called by launchd (com.facelessstack.claim) at 00:05/08:05/12:05/19:05/21:05 local.
export ELECTRON_RUN_AS_NODE=1
WS="$HOME/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd"
exec /Applications/ZCode.app/Contents/MacOS/ZCode "$WS/free-token-claim/driver.cjs" claim
