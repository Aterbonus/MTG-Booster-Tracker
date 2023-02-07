<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const appName = "Aterbonus' MTG Booster Tracker"
const themeMode = useLocalStorage('theme-mode', 'dark')
const date = new Date()

function toggleTheme() {
	themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
}

function twoDigits(n: number) {
	return n.toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	})
}

useHead({
	title: appName,
	meta: [{ name: 'description', content: 'Keep track of your cards when opening boosters.' }]
})
</script>

<template>
	<v-app :theme="themeMode">
		<v-app-bar>
			<v-app-bar-title>{{ appName }}</v-app-bar-title>
			<strong class="text-subtitle-2 d-none">Last update: {{ twoDigits(date.getFullYear()) }}-{{ twoDigits(date.getMonth() + 1) }}-{{ twoDigits(date.getDate()) }} {{ twoDigits(date.getHours()) }}:{{ twoDigits(date.getMinutes()) }}</strong>
			<v-btn icon @click="toggleTheme">
				<v-icon v-if="themeMode === 'light'">mdi-white-balance-sunny</v-icon>
				<v-icon v-else>mdi-weather-night</v-icon>
			</v-btn>
			<v-btn icon href="https://github.com/Aterbonus/MTG-Booster-Tracker" target="_blank">
				<v-icon>mdi-github</v-icon>
			</v-btn>
		</v-app-bar>
		<v-main>
			<ClientOnly>
				<Main />
			</ClientOnly>
		</v-main>
		<v-footer app border absolute class="flex-column text-center">
			<p>
				{{ appName }} is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the
				materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
			</p>
			<p>Sets and cards data obtained from <a href="https://scryfall.com/docs/api" target="_blank">Scryfall</a>.</p>
		</v-footer>
	</v-app>
</template>
