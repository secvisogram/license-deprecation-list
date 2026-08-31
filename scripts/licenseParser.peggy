license = S front_matter_start S frontMatter:front_matter S front_matter_end licenseText:license_text {
  return frontMatter
}

front_matter = lines:(known_line / unknown_line)+ {
  return Object.fromEntries(lines.filter((line) => line !== null))
}

known_line = key:[a-zA-Z_]+ ":" _ value:[^\n]+ "\n" {
  return [key.join(''), value.join('')]
}

// lines that don't match the "key: value" format are skipped instead of failing the parse
unknown_line = !front_matter_end [^\n]* "\n" {
  return null
}

front_matter_start = "---\n"

front_matter_end = "---" "\n"?

license_text = chars:.* { return chars.join('') }

_ = [ \t\r]*

S = [ \t\r\n]*
