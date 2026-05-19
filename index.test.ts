import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isDeprecatedAboutCodeException,
  isDeprecatedAboutCodeLicense,
  isDeprecatedSpdxException,
  isDeprecatedSpdxLicense,
} from './index.js'

describe('license deprecation list', () => {
  describe('about code isDeprecatedAboutCodeLicense', () => {
    it('check isDeprecatedAboutCodeLicense with deprecated about code license ', () => {
      assert.equal(isDeprecatedAboutCodeLicense('trademark-notice'), true)
    })

    it('check isDeprecatedAboutCodeLicense with None deprecated about code license ', () => {
      assert.equal(isDeprecatedAboutCodeLicense('AFL-3.0'), false)
    })

    it('check isDeprecatedAboutCodeLicense with deprecated about exception ', () => {
      assert.equal(
        isDeprecatedAboutCodeLicense('unlimited-binary-linking'),
        false,
      )
    })

    it('check isDeprecatedAboutCodeLicense with None deprecated about code exception ', () => {
      assert.equal(isDeprecatedAboutCodeLicense('389-exception'), false)
    })
  })

  describe('about code isDeprecatedAboutCodeException', () => {
    it('check isDeprecatedAboutCodeLicense with deprecated about code license ', () => {
      assert.equal(isDeprecatedAboutCodeException('trademark-notice'), false)
    })

    it('check isDeprecatedAboutCodeException with None deprecated about code license ', () => {
      assert.equal(isDeprecatedAboutCodeException('AFL-3.0'), false)
    })

    it('check isDeprecatedAboutCodeException with deprecated about exception ', () => {
      assert.equal(
        isDeprecatedAboutCodeException('unlimited-binary-linking'),
        true,
      )
    })

    it('check isDeprecatedAboutCodeException with None deprecated about code exception ', () => {
      assert.equal(isDeprecatedAboutCodeException('389-exception'), false)
    })
  })

  describe('spdx isDeprecatedSpdxLicense', () => {
    it('check isDeprecatedSpdxLicense with deprecated spdx license', () => {
      assert.equal(isDeprecatedSpdxLicense('AGPL-1.0'), true)
    })

    it('check isDeprecatedSpdxLicense with None deprecated spdx license ', () => {
      assert.equal(isDeprecatedSpdxLicense('AFL-3.0'), false)
    })

    it('check isDeprecatedSpdxLicense with None deprecated spdx exception ', () => {
      assert.equal(isDeprecatedSpdxLicense('SHL-2.1'), false)
    })
  })

  describe('spdx isDeprecatedSpdxException', () => {
    it('check isDeprecatedSpdxException with deprecated spdx license', () => {
      assert.equal(isDeprecatedSpdxException('AGPL-1.0'), false)
    })

    it('check isDeprecatedSpdxException with None deprecated spdx license ', () => {
      assert.equal(isDeprecatedSpdxException('AFL-3.0'), false)
    })

    it('check isDeprecatedSpdxException with None deprecated spdx exception ', () => {
      assert.equal(isDeprecatedSpdxException('SHL-2.1'), false)
    })
  })
})
