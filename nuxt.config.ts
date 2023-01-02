import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
	modules: [
		'@nuxtjs/critters',
		'@vueuse/nuxt',
		(_options, nuxt) => {
			nuxt.hooks.hook('vite:extendConfig', config => config.plugins?.push(vuetify()))
		}
	],
	ssr: false,
	critters: {
		config: {
			preload: false
		}
	}
})
