const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '',
  chainWebpack: config => {
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .type('asset/source')
    // Toujours émettre les polices en fichiers séparés (jamais inlinées en
    // base64), pour qu'elles restent chargées à la demande, pas dans le CSS.
    config.module
      .rule('fonts')
      .set('parser', { dataUrlCondition: { maxSize: 0 } })
  }
})
