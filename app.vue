<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const appName = "Aterbonus' MTG Booster Tracker"

useHead({
	title: appName,
	meta: [{ name: 'description', content: 'Keep track of your cards when opening boosters.' }]
})
</script>

<template>
	<v-app>
		<v-app-bar>
			<v-app-bar-title>{{ appName }}</v-app-bar-title>
			<v-btn icon href="https://github.com/Aterbonus/MTG-Booster-Tracker" target="_blank">
				<v-icon>mdi-github</v-icon>
			</v-btn>
		</v-app-bar>
		<v-main>
			<ClientOnly>
				<Main />
			</ClientOnly>
		</v-main>
		<v-footer border app>
			{{ appName }} is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the
			materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
		</v-footer>
	</v-app>
</template>
