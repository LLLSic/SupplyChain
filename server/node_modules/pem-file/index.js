const PUBLIC_KEY = 'PUBLIC KEY'
const CERTIFICATE = 'CERTIFICATE'
const PRIVATE_KEY = 'PRIVATE KEY'

module.exports = {
  encode,
  decode,

  // Constants.
  PUBLIC_KEY,
  CERTIFICATE,
  PRIVATE_KEY
}

const before = '-----BEGIN'
const after = '-----END'
const endline = '-----'
const header = new RegExp(`^${before} ([A-Z ]+)${endline}`)

/**
 * Convert data to PEM format.
 * @param {Buffer} source
 * @param {string} label
 * @returns {String}
 */
function encode(source, label) {
  if (!Buffer.isBuffer(source)) {
    throw new TypeError('Argument `source` should be a Buffer.')
  }

  if (typeof label !== 'string') {
    throw new TypeError('Argument `label` should be a string in upper case.')
  }

  const prefix = before + ' ' + label + endline
  const suffix = after + ' ' + label + endline

  const body = source.toString('base64').replace(/(.{64})/g, '$1\r\n')

  return [prefix, body, suffix].join('\r\n')
}

/**
 * Convert PEM formatted data to raw buffer.
 * @param {Buffer|String} pem
 * @returns {Buffer}
 */
function decode(pem) {
  if (Buffer.isBuffer(pem)) {
    pem = pem.toString('ascii')
  }

  const lines = pem.trim().split('\n')

  if (lines.length < 3) {
    throw new Error('Invalid PEM data.')
  }

  const match = header.exec(lines[0])

  if (match === null) {
    throw new Error('Invalid label.')
  }

  const label = match[1]
  let i = 1

  for (; i < lines.length; ++i) {
    if (lines[i].startsWith(after)) {
      break
    }
  }

  const footer = new RegExp(`^${after} ${label}${endline}\r?\n?$`)

  if (footer.exec(lines[i]) === null) {
    throw new Error('Invalid end of file.')
  }

  const body = lines.slice(1, i).join('\n').replace(/\r?\n/g, '')
  return Buffer.from(body, 'base64')
}
