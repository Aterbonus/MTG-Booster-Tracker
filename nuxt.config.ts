export default defineNuxtConfig({
	modules: ['@nuxtjs/critters', '@unocss/nuxt', '@vueuse/nuxt'],
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
