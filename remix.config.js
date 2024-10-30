export default {
  serverNodeBuiltinsPolyfill: {
    modules: { buffer: true, crypto: true },
    globals: {
      Buffer: true,
    },
  },
}
