#!/usr/bin/env bash
set -eo pipefail

PLUGINS=$1
RESHIM=0

if [ -z "$PLUGINS" ]; then
    echo "*** ERROR: no plugins argument was provided ***"
    exit 1
fi

if ! command -v asdf >/dev/null 2>&1; then
    echo "asdf is not installed!"
    exit 1
fi

for plugin in $PLUGINS; do
    if asdf where "$plugin" > /dev/null 2>&1; then
        continue
    fi
    RESHIM=1    
    case "$plugin" in
    "shellcheck")
        asdf plugin add shellcheck https://github.com/luizm/asdf-shellcheck.git || true
        ;;
    *)
        asdf plugin add "$plugin"
        ;;
    esac
    echo "installing $plugin"
    asdf install "$plugin"
done

if [ "$RESHIM" -eq 1 ]; then
    echo "asdf reshimming..."
    asdf reshim
fi

FIRST_PLUGIN="$(echo "$1" | cut -d' ' -f1)"

if which "$FIRST_PLUGIN" | grep -q "$HOME/.asdf"; then
    echo "asdf installed tooling successfully"
    exit 0
fi

echo "*** ERROR: asdf environment/installation failed! ***"
echo "'which $FIRST_PLUGIN' does not contain path $HOME/.asdf"
echo "(check asdf shims come before other package/version managers in your PATH)"
exit 1
