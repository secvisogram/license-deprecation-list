import { exceptions } from './exceptions.js'
import { licenses } from './licenses.js'

type MapValue<T> = T extends Map<infer _, infer Value> ? Value : never

export type LicenseEntry = MapValue<typeof licenses | typeof exceptions>
