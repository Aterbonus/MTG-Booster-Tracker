export default defineNuxtConfig({
	modules: ['@nuxtjs/critters', '@vueuse/nuxt'],
	ssr: false,
	unocss: {
		preflight: true
	},
	critters: {
		config: {
			preload: false
		}
	}
})
