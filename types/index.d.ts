export interface PluginUserConfig {
    paths?: string[]
    tables?: boolean
    doctype?: string
    postcss?: {
        globalData?: import('@csstools/postcss-global-data').pluginOptions
        customProperties?: import('postcss-custom-properties').pluginOptions
    }
    options?: import('juice').Options
    juiceLink?: (href: string) => string | Promise<string>
}

export default function plugin(options?: PluginUserConfig) : import('vite').Plugin
