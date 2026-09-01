# Create SPDX and AboutCode license information files

Scripts to create the `lib/licenses.js` and `lib/exceptions.js` files. These files are used to store the license/exception deprecation information from spdx and aboutcode.

## Prerequisites

- Git must be installed locally and available in your PATH.
- The `scancode-toolkit` and `license-list-data` git submodules (declared in `.gitmodules`) must be checked out, e.g. via `git submodule update --init` (or clone the repo with `--recurse-submodules`). `scancode-toolkit` is the AboutCode source, `license-list-data` is the SPDX source.

## Usage

Run `npm run update_license_information`, which executes `node scripts/update_license_information.ts`. It reads license/exception data and deprecation history from both submodules and (re)writes `lib/licenses.js` and `lib/exceptions.js`.
