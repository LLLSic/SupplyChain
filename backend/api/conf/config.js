import { pem, key, cert, ca } from './allConfig'
export default {
  'privateKey': {
    'type': 'pem',
    'value': pem
  },
  'nodes': [
    {
      'ip': '47.98.133.64',
      'port': '20200'
    }
  ],
  'authentication': {
    'key': key,
    'cert': cert,
    'ca': ca
  },
  'groupID': 1,
  'timeout': 10000
}
