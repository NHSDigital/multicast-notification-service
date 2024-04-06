#!/usr/bin/env bash
set -eo pipefail

ASDF_VERSION="v0.14.0"
PLUGINS=$1
RESHIM=0

if [ -z "$PLUGINS" ]; then
    echo "*** ERROR: no plugins argument was provided ***"
    exit 1
fi

if ! command -v asdf >/dev/null 2>&1; then
    # asdf not installed, install it
    echo "installing asdf version $ASDF_VERSION"
    git clone https://github.com/asdf-vm/asdf.git "$HOME/.asdf" --branch $ASDF_VERSION -c advice.detachedHead=false
    echo ". $HOME/.asdf/asdf.sh" >> "$HOME/.profile"
    echo ". $HOME/.asdf/completions/asdf.bash" >> "$HOME/.profile"
    echo "installed asdf version $(asdf version)"
else
    INSTALLED_VERSION=$(asdf version | cut -d' ' -f2)
    # If the installed version starts with ASDF_VERSION, print a message and exit
    if [[ "$INSTALLED_VERSION" == "$ASDF_VERSION"* ]]; then
        echo "asdf version $ASDF_VERSION is already installed"
    else
        # old version - update to ASDF_VERSION
        echo "updating asdf to version $ASDF_VERSION"
        cd "$HOME/.asdf"
        git fetch
        git checkout "$ASDF_VERSION"
        cd -
    fi
fi

# shellcheck source=/dev/null
source "$HOME/.profile"

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
