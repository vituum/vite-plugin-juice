import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssHtml from 'postcss-html'
import postcssGlobalData from '@csstools/postcss-global-data'
import { relative } from 'path'
import juice from 'juice'
import * as parse5 from 'parse5'
import { getPackageInfo, normalizePath, merge, pluginError } from 'vituum/utils/common.js'

const { name } = getPackageInfo(import.meta.url)

/**
 * @type {import('@vituum/vite-plugin-juice/types').PluginUserConfig}
 */
const defaultOptions = {
  paths: ['src/pages/email'],
  tables: true,
  doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  postcss: {
    globalData: {},
    customProperties: {
      preserve: false,
    },
  },
  options: {},
}

/**
 * @param {import('@vituum/vite-plugin-juice/types').PluginUserConfig} pluginOptions
 * @returns import('vite').Plugin
 */
const plugin = (pluginOptions = {}) => {
  let resolvedConfig

  pluginOptions = merge(defaultOptions, pluginOptions)

  return {
    name,
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config
    },
    transformIndexHtml: {
      order: 'post',
      handler: async (html, { filename, bundle, server }) => {
        const filePath = relative(resolvedConfig.root, filename)
        const paths = pluginOptions.paths
        let extraCss = ''

        if (paths.length === 0 || paths.filter(path => filePath.startsWith(relative(resolvedConfig.root, normalizePath(path)))).length === 0) {
          return html
        }

        const document = parse5.parse(html)
        // @ts-ignore
        const headNodes = document.childNodes[1].childNodes[0].childNodes
        const headLinks = headNodes.filter(({ nodeName, attrs }) => nodeName === 'link' && attrs.filter(({ name, value }) => name === 'rel' && value === 'stylesheet'))

        for (const link of headLinks) {
          const href = link.attrs.filter(({ name }) => name === 'href')[0].value

          if (href && !href.startsWith('http')) {
            if (server) {
              const resultCss = await server.transformRequest(href + '?direct', {
                html: false,
              }).catch(error => pluginError(error, server, name))

              if (resultCss?.code) {
                extraCss += resultCss?.code
              }
            }
            else {
              const bundledCss = bundle[href.startsWith('/') ? href.slice(1) : href]?.source

              if (bundledCss) {
                extraCss += bundledCss
              }
              else {
                throw new TypeError(`${href} doesn't exists in bundle`)
              }
            }

            headNodes.splice(headNodes.indexOf(link), 1)
          }

          html = parse5.serialize(document)
          html = html.replace('</head>', `<style>${extraCss}</style></head>`)
        }

        html = html.replace('<!DOCTYPE html>', pluginOptions.doctype)

        if (pluginOptions.tables) {
          html = html.replaceAll('<table', '<table border="0" cellpadding="0" cellspacing="0"')
        }

        html = html.replace('</head>', '</head><!-- postcss-disable -->')

        const result = postcss([postcssGlobalData(pluginOptions.postcss.globalData), postcssCustomProperties(pluginOptions.postcss.customProperties)]).process(html, { syntax: postcssHtml() })

        const output = result.content.replace('</head><!-- postcss-disable -->', '</head>')

        return juice(output, pluginOptions.options)
      },
    },
  }
}

export default plugin
