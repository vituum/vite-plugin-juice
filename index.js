import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssGlobalData from '@csstools/postcss-global-data'
import { relative } from 'path'
import juice from 'juice'
import * as parse5 from 'parse5'
import { getPackageInfo, normalizePath, deepMergeWith, pluginError } from 'vituum/utils/common.js'

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
    plugins: [],
  },
  options: {},
}

/**
 * @param {Object} node
 * @param {Function} predicate
 * @param {Array} [results=[]]
 * @returns {Array}
 */
const findAllNodes = (node, predicate, results = []) => {
  if (predicate(node)) results.push(node)
  if (node.childNodes) {
    for (const child of node.childNodes) {
      findAllNodes(child, predicate, results)
    }
  }
  return results
}

/**
 * @param {import('@vituum/vite-plugin-juice/types').PluginUserConfig} pluginOptions
 * @returns import('vite').Plugin
 */
const plugin = (pluginOptions = {}) => {
  let resolvedConfig

  pluginOptions = deepMergeWith(defaultOptions, pluginOptions)

  return {
    name,
    enforce: 'post',
    /**  @param {import('vite').ResolvedConfig} config */
    configResolved(config) {
      resolvedConfig = config
    },
    transformIndexHtml: {
      order: 'post',
      handler: async (html, { filename, bundle, server }) => {
        const filePath = relative(resolvedConfig.root, filename)
        const paths = pluginOptions.paths
        let transformedCss = ''

        if (paths.length === 0 || paths.filter(path => filePath.startsWith(relative(resolvedConfig.root, normalizePath(path)))).length === 0) {
          return html
        }

        const document = parse5.parse(html)

        const styleLinks = findAllNodes(document, n =>
          n.nodeName === 'link'
          && n.attrs?.some(a => a.name === 'rel' && a.value === 'stylesheet')
          && !n.attrs?.some(a => a.name === 'data-vite-juice' && a.value === 'ignore'),
        )

        for (const link of styleLinks) {
          const parent = link.parentNode
          const href = link.attrs.filter(({ name }) => name === 'href')[0].value

          if (href && !href.startsWith('http')) {
            if (server) {
              const resultCss = await server.transformRequest(href + '?direct', {
                html: false,
              }).catch(error => pluginError(error, server, name))

              if (resultCss?.code) {
                transformedCss += resultCss?.code
              }
            }
            else {
              const bundledCss = bundle[href.startsWith('/') ? href.slice(1) : href]?.source

              if (bundledCss) {
                transformedCss += bundledCss
              }
              else {
                throw new TypeError(`${href} doesn't exists in bundle`)
              }
            }

            parent.childNodes.splice(parent.childNodes.indexOf(link), 1)
          }

          html = parse5.serialize(document)
        }

        html = html.replace('<!DOCTYPE html>', pluginOptions.doctype)

        if (pluginOptions.tables) {
          html = html.replaceAll('<table', '<table border="0" cellpadding="0" cellspacing="0"')
        }

        if (transformedCss) {
          const processedCss = postcss(
            [
              postcssGlobalData(pluginOptions.postcss.globalData),
              postcssCustomProperties(pluginOptions.postcss.customProperties),
              ...pluginOptions.postcss.plugins,
            ],
          ).process(transformedCss, pluginOptions.postcss.processOptions)

          html = html.replace('</head>', `<style>${processedCss}</style></head>`)
        }

        return juice(html, pluginOptions.options)
      },
    },
  }
}

export default plugin
