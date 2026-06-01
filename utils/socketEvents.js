let emitUserCountFn = null;

function setEmitUserCount(fn) {
  emitUserCountFn = fn;
}

async function emitUserCount() {
  if (typeof emitUserCountFn === 'function') {
    return emitUserCountFn();
  }
}

module.exports = { setEmitUserCount, emitUserCount };
