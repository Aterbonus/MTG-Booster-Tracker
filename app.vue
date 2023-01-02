<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { Set as MTGSet } from '@prisma/client'
import type { VTextField } from 'vuetify/lib/components'
import { DB, MTGCard } from './prisma/db'
import type { Item } from './components/Combobox.vue'

interface SelectedSetCard extends MTGCard {
	count: number
}

interface SelectedSet extends MTGSet {
	cards: SelectedSetCard[]
}

const db = new DB()
await db.init()

// [SETS]
const sets = db.getSets()
const includeSubsets = ref(false)
const selectedSets = ref<SelectedSet[]>([])

function setTitleFunc(item: unknown) {
	return `${(item as MTGSet).name} (${(item as MTGSet).code})`
}

function onSetSelected(setItem: Item<unknown>) {
	const set = setItem.value as MTGSet

	selectedSets.value.push({ ...set, cards: [] })

	if (!(set.code in cards.value)) {
		// To no execute again
		cards.value[set.code] = []
		cards.value[set.code] = db.getSetCards(set.id)
	}

	if (includeSubsets.value) {
		addSubsets(set)
	}
}

function addSubsets(set: MTGSet) {
	const subSets = sets.filter(s => s.parent_set_code === set.code)

	console.log(set)

	if (subSets?.length) {
		selectedSets.value = selectedSets.value.concat(subSets.map(set => ({ ...set, cards: [] })))

		subSets.forEach(set => addSubsets(set))
	}
}

function removeSelectedSet(index: number) {
	selectedSets.value.splice(index, 1)
}
// [/SETS]

// [CARDS]
const cards = ref<{ [key: string]: MTGCard[] }>({})
const cardsInputsRefs = ref<VTextField[]>([])

function onCardSelected(set: SelectedSet, index: number) {
	const card = cards.value[set.code].find(card => card.collector_number === cardsInputsRefs.value[index]?.value)

	if (card) {
		const selectedSetCard = set.cards.find(c => c.collector_number === card.collector_number)

		if (selectedSetCard) {
			++selectedSetCard.count
		} else {
			const index = set.cards.findIndex(c => c.collector_number > card.collector_number)

			if (index >= 0) {
				set.cards.splice(index, 0, { ...card, count: 1 })
			} else {
				set.cards.push({ ...card, count: 1 })
			}
		}
	}

	cardsInputsRefs.value[index]?.reset()
}

function removeSelectedCard(set: SelectedSet, cardIndex: number) {
	set.cards.splice(cardIndex, 1)
}
// [/CARDS]

const copyTextForMoxfield = computed(() => {
	return selectedSets.value.reduce(
		(prev, curr) =>
			prev + curr.cards.reduce((prev, curr) => prev + `${curr.count} ${curr.name} (${curr.set_code}) ${curr.collector_number}\n`, ''),
		''
	)
})
const { copy, isSupported, copied } = useClipboard({ source: copyTextForMoxfield })
</script>

<template>
	<v-app>
		<v-app-bar title="Aterbonus' MTG Opener" />
		<v-main>
			<v-container>
				<v-row class="align-center">
					<v-col cols="12" md="4">
						<combobox :items="sets" label="Set" title="name" :title-func="setTitleFunc" @change="onSetSelected" />
					</v-col>
					<v-col cols="6" md="4">
						<v-checkbox v-model="includeSubsets" label="Include subsets" hide-details />
					</v-col>
					<v-col cols="6" md="4">
						<v-btn v-if="isSupported" class="border border-black rounded p-2" block @click="copy()">
							<span v-if="!copied">Copy for Moxfield</span>
							<span v-else>Copied!</span>
						</v-btn>
					</v-col>
				</v-row>
				<v-row>
					<v-col v-for="(set, setIndex) of selectedSets" :key="set.code" cols="12" sm="6" md="4" xl="3">
						<v-card>
							<template #title>{{ set.name }}</template>
							<template #append
								><v-btn icon="mdi-close" color="red" variant="text" tabindex="-1" @click="removeSelectedSet(setIndex)"
							/></template>
							<v-text-field ref="cardsInputsRefs" label="Card" hide-details @change="onCardSelected(set, setIndex)" />
							<v-card-text v-if="set.cards.length">
								<v-list density="compact">
									<v-list-item v-for="(card, cardIndex) of set.cards" :key="card.id" _value="card">
										<v-list-item-title>{{ card.name }} x {{ card.count }}</v-list-item-title>
										<template #append>
											<v-btn icon="mdi-close" color="red" variant="text" tabindex="-1" @click="removeSelectedCard(set, cardIndex)" />
										</template>
									</v-list-item>
								</v-list>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-container>
		</v-main>
		<v-footer border app>
			Aterbonus' MTG Opener is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of
			the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
		</v-footer>
	</v-app>
</template>
