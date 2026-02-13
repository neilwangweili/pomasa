#!/bin/bash
# Export pattern-relationships.key to PNG via Keynote AppleScript

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEY_FILE="$SCRIPT_DIR/pattern-relationships.key"
TMP_DIR=$(mktemp -d)

osascript -e "
tell application \"Keynote\"
    open POSIX file \"$KEY_FILE\"
    delay 2
    set theDoc to front document
    export theDoc as slide images to POSIX file \"$TMP_DIR\" with properties {image format:PNG, skipped slides:false}
    close theDoc saving no
end tell
"

# Keynote exports as <dirname>.001.png; move to target
EXPORTED=$(ls "$TMP_DIR"/*.png 2>/dev/null | head -1)
if [ -n "$EXPORTED" ]; then
    mv "$EXPORTED" "$SCRIPT_DIR/pattern-relationships.png"
    echo "Exported: $SCRIPT_DIR/pattern-relationships.png"
else
    echo "Export failed." >&2
    exit 1
fi

rm -rf "$TMP_DIR"
