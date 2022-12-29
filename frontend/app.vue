<script lang="ts" setup>
interface Set {
	id: string
	code: string
	parent_set_code: string
	name: string
	icon_svg_uri: string
	card_count: number
	released_at: string
}

interface Card {
	id: string
	name: string
	image?: string
	collector_number: string
	set_id: string
}

interface SelectedSetCard extends Card {
	count: number
}

interface SelectedSet extends Set {
	cards: SelectedSetCard[]
}

const config = useRuntimeConfig()
const { data: sets } = useFetch<Set[]>(config.public.apiBase + 'sets')
const includeSubsets = ref(true)
const selectedSets = ref<SelectedSet[]>([])
const cards = ref<{ [key: string]: Card[] }>({})

watch(
	selectedSets,
	selectedSets => {
		selectedSets.forEach(set => {
			if (!(set.code in cards.value)) {
				// To no execute again
				cards.value[set.code] = []

				$fetch<Card[]>(config.public.apiBase + `cards?setId=${set.id}`).then(cardsArr => (cards.value[set.code] = cardsArr))
			}
		})
	},
	{
		deep: true
	}
)

function onSetSelected(target: HTMLInputElement) {
	const set = sets.value?.find(set => target.value === set.code)

	if (set) {
		selectedSets.value.push({ ...set, cards: [] })

		if (includeSubsets.value) {
			addSubsets(set)
		}
	}

	target.value = ''
}

function addSubsets(set: Set) {
	const subSets = sets.value?.filter(s => s.parent_set_code === set.code)

	if (subSets?.length) {
		selectedSets.value = selectedSets.value.concat(subSets.map(set => ({ ...set, cards: [] })))

		subSets.forEach(set => addSubsets(set))
	}
}

function onCardSelected(set: SelectedSet, target: HTMLInputElement) {
	const card = cards.value[set.code].find(card => card.collector_number === target.value)

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

	target.value = ''
}
</script>

<template>
	<div>
		<input
			list="set-list"
			class="border border-black border-rounded"
			@keyup.enter="onSetSelected($event.target! as HTMLInputElement)"
			@change="onSetSelected($event.target! as HTMLInputElement)"
		/>
		<datalist id="set-list">
			<option v-for="set of sets" :key="set.code" :value="set.code">{{ set.name }}</option>
		</datalist>
		<label>
			Include subsets:
			<input v-model="includeSubsets" type="checkbox" />
		</label>
		<table>
			<thead>
				<tr>
					<th v-for="set of selectedSets" :key="set.code">{{ set.name }}</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td v-for="(set, i) of selectedSets" :key="set.code">
						<input
							:list="`card-list-${i}`"
							class="border border-black border-rounded"
							@keyup.enter="onCardSelected(set, $event.target! as HTMLInputElement)"
							@change="onCardSelected(set, $event.target! as HTMLInputElement)"
						/>
						<datalist v-if="cards[set.code]" :id="`card-list-${i}`">
							<option v-for="card of cards[set.code]" :key="card.id" :value="card.collector_number">{{ card.name }}</option>
						</datalist>
					</td>
				</tr>
				<tr>
					<td v-for="set of selectedSets" :key="set.code">
						<ul v-for="card of set.cards" :key="card.id">
							<li>{{ card.name }} x {{ card.count }}</li>
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
