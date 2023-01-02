export default defineNuxtConfig({
	modules: ['@nuxtjs/critters', '@vueuse/nuxt'],
	ssr: false,
	critters: {
		config: {
			preload: false
		}
	}
})
