export interface PluginUserConfig {
    paths?: string[]
    tables?: boolean
    doctype?: string
    postcss?: {
        globalData?: import('@csstools/postcss-global-data').pluginOptions
        customProperties?: import('postcss-custom-properties').pluginOptions
        processOptions?: import('postcss').ProcessOptions
        plugins?: import('postcss').AcceptedPlugin[]
    }
    options?: import('juice').Options
}

export default function plugin(options?: PluginUserConfig) : import('vite').Plugin
