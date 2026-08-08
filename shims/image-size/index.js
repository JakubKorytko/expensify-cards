'use strict';

const fs = require('fs');
const probe = require('probe-image-size/sync');

function imageSize(input) {
  let buf = input;
  if (typeof buf === 'string') {
    buf = fs.readFileSync(buf);
  } else if (!Buffer.isBuffer(buf)) {
    if (ArrayBuffer.isView(buf)) {
      buf = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
      buf = Buffer.from(buf);
    }
  }

  const result = probe(buf);
  if (!result) {
    throw new TypeError('unsupported file type');
  }
  return {
    width: result.width,
    height: result.height,
    type: result.type,
  };
}

module.exports = imageSize;
module.exports.default = imageSize;
module.exports.imageSize = imageSize;
module.exports.disableTypes = () => {};
module.exports.types = [];
