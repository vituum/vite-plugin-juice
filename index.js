import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssHtml from 'postcss-html'
import { relative } from 'path'
import juice from 'juice'
import * as parse5 from 'parse5'
import { getPackageInfo } from 'vituum/utils/common.js'

const { name } = getPackageInfo(import.meta.url)

/**
 * @type {import('@vituum/vite-plugin-juice/types/index.d.ts').PluginUserConfig}
 */
const defaultOptions = {
    paths: ['src/emails', 'src/pages/email'],
    tables: true,
    doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    options: {},
    juiceCssLink: async (href) => href
}

/**
 * @param {import('@vituum/vite-plugin-juice/types/index.d.ts').PluginUserConfig} pluginOptions
 * @returns import('vite').Plugin
 */
const plugin = (pluginOptions = {}) => {
    let resolvedConfig

    pluginOptions = Object.assign(defaultOptions, pluginOptions)

    return {
        name,
        enforce: 'post',
        configResolved (config) {
            resolvedConfig = config
        },
        transformIndexHtml: {
            enforce: 'post',
            transform: async (html, { filename }) => {
                const filePath = relative(resolvedConfig.root, filename)
                const paths = pluginOptions.paths
                let extraCss = ''

                if (paths.length === 0 || paths.filter(path => filePath.startsWith(relative(resolvedConfig.root, path))).length === 0) {
                    return html
                }

                if (html.includes('data-juice-link')) {
                    const document = parse5.parse(html)
                    // @ts-ignore
                    const headNodes = document.childNodes[1].childNodes[0].childNodes
                    const headLinks = headNodes.filter(({ nodeName, attrs }) => nodeName === 'link' && attrs.filter(({ name }) => name === 'data-juice-css'))

                    for (const link of headLinks) {
                        const href = link.attrs.filter(({ name }) => name === 'data-href')[0].value

                        if (typeof pluginOptions.juiceCssLink === 'function') {
                            extraCss += await pluginOptions.juiceCssLink(href)
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

                const result = postcss([postcssCustomProperties({
                    preserve: false
                })]).process(html, { syntax: postcssHtml() })

                const output = result.content.replace('</head><!-- postcss-disable -->', '</head>')

                return juice(output, pluginOptions.options)
            }
        }
    }
}

export default plugin
