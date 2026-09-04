# license-deprecation-list

This repository tracks when license identifiers or expressions from SPDX and AboutCode were deprecated.
It provides two lists: one for licenses and one for exceptions. These lists are automatically generated from the `scancode-toolkit` (AboutCode) and `license-list-data` (SPDX) git submodules. See [scripts/README.md](scripts/README.md) for how to regenerate it.

## Installation

```sh
npm install @secvisogram/license-deprecation-list
```

## Usage

The package exports two `Map<license_key, LicenseEntry>` objects, `licenses` and `exceptions`:

```js
import { licenses, exceptions } from '@secvisogram/license-deprecation-list'

const entry = licenses.get('lgpl-2.1-nokia-qt')
if (entry?.is_deprecated) {
  console.log(`${entry.license_key} deprecated since ${entry.deprecated_since}`)
}
```

Each `LicenseEntry` has the following shape:

| Field              | Type                    | Description                                                     |
| ------------------ | ----------------------- | --------------------------------------------------------------- |
| `license_key`      | `string`                | The license or exception identifier (map key).                  |
| `is_deprecated`    | `boolean`               | Whether the identifier is deprecated.                           |
| `is_exception`     | `boolean`               | Whether the entry is a license exception rather than a license. |
| `source`           | `'aboutCode' \| 'spdx'` | Which submodule the entry was sourced from.                     |
| `deprecated_since` | `string \| null`        | The version the identifier was deprecated in, if any.           |
| `deprecated_date`  | `string \| null`        | The date the identifier was deprecated, if any.                 |

## Development

Prerequisites:

- Git must be installed locally and available in your `PATH`.
- The `scancode-toolkit` (AboutCode) and `license-list-data` (SPDX) git submodules, declared in `.gitmodules`, must be checked out, e.g. via `git submodule update --init --remote` (or clone the repo with `--recurse-submodules`).

Running `npm install` also runs the `prepare` script, which generates `scripts/licenseParser.js` from the `scripts/licenseParser.peggy` grammar.

To regenerate `lib/licenses.js` and `lib/exceptions.js` from the submodules, run `npm run update_license_information`. See [scripts/README.md](scripts/README.md) for details.

Run `npm test` to check formatting and types (`oxfmt --check && tsc -b .`); there are currently no runtime tests.

## License

[Apache-2.0](LICENSE)
