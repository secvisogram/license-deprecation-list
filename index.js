import { licenses } from './lib/license_information.js'

/** @type {import("./lib/license_information.js").LicenseInfo[]} */
const allLicenses =
  /** @type {import("./lib/license_information.js").LicenseInfo[]}} */ (
    licenses
  )

/** @type {import("./lib/license_information.js").LicenseInfo[]}} */
const DEPRECATED_ABOUT_CODE_LICENSE_KEYS = allLicenses.filter(
  (license) =>
    license.is_deprecated &&
    license.source === 'aboutCode' &&
    !license.is_exception,
)

/** @type {import("./lib/license_information.js").LicenseInfo[]}} */
const DEPRECATED_ABOUT_CODE_EXCEPTION_KEYS = allLicenses.filter(
  (license) =>
    license.is_deprecated &&
    license.source === 'aboutCode' &&
    license.is_exception,
)

/** @type {import("./lib/license_information.js").LicenseInfo[]}} */
const DEPRECATED_SPDX_EXCEPTION_KEYS = allLicenses.filter(
  (license) =>
    license.is_deprecated && license.source === 'spdx' && license.is_exception,
)

/** @type {import("./lib/license_information.js").LicenseInfo[]}} */
const DEPRECATED_SPDX_LICENSE_KEYS = allLicenses.filter(
  (license) =>
    license.is_deprecated && license.source === 'spdx' && !license.is_exception,
)

/**
 * Check whether the given license key is a deprecated about code license
 * @param {string} license_key
 * @returns {boolean}
 */
export function isDeprecatedAboutCodeLicense(license_key) {
  const license = DEPRECATED_ABOUT_CODE_LICENSE_KEYS.find(
    (elem) => elem.license_key === license_key,
  )

  return !!license
}

/**
 * Check whether the given license key is a deprecated spdx license
 * @param {string} license_key
 * @returns {boolean}
 */
export function isDeprecatedSpdxLicense(license_key) {
  const license = DEPRECATED_SPDX_LICENSE_KEYS.find(
    (elem) => elem.license_key === license_key,
  )

  return !!license
}

/**
 * Check whether the given license key is a deprecated about code exception
 * @param {string} license_key
 * @returns {boolean}
 */
export function isDeprecatedAboutCodeException(license_key) {
  const license = DEPRECATED_ABOUT_CODE_EXCEPTION_KEYS.find(
    (elem) => elem.license_key === license_key,
  )

  return !!license
}

/**
 * Check whether the given license key is a deprecated spdx exception
 * @param {string} license_key
 * @returns {boolean}
 */
export function isDeprecatedSpdxException(license_key) {
  const license = DEPRECATED_SPDX_EXCEPTION_KEYS.find(
    (elem) => elem.license_key === license_key,
  )

  return !!license
}
