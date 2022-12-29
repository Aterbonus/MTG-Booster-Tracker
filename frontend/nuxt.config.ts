export default defineNuxtConfig({
	modules: ['@nuxtjs/critters', '@unocss/nuxt', '@vueuse/nuxt'],
	runtimeConfig: {
		public: {
			apiBase: ''
		}
	},
	unocss: {
		preflight: true
	},
	critters: {
		config: {
			preload: false
		}
	}
})
