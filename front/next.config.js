// const CompressPlugin = require('compression-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  compress: true, // compress가 이미 있어서 기존 라이브러리 설치안해도되고 대체가된다.
  webpack(config, { webpack }) {
    const prod = process.env.NODE_ENV === 'production';
    const plugins = [...config.plugins,
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /\/ko$/),
    ];

    /*
    if (prod) {
      plugins.push(new CompressPlugin());
    }
    */

    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval',
      plugins,
    };
  },
});
