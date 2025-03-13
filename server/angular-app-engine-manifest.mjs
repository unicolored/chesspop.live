
export default {
  basePath: 'https://unicolored.github.io/chessfield-live',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
