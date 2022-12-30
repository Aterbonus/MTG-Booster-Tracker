<script lang="ts" setup>
import { Set as MTGSet } from '@prisma/client'
import { DB, MTGCard } from './prisma/db'

interface SelectedSetCard extends MTGCard {
	count: number
}

interface SelectedSet extends MTGSet {
	cards: SelectedSetCard[]
}

const db = new DB()
await db.init()

const sets = db.getSets()
const includeSubsets = ref(true)
const selectedSets = ref<SelectedSet[]>([])
const cards = ref<{ [key: string]: MTGCard[] }>({})
const copyTextForMoxfield = computed(() => {
	return selectedSets.value.reduce(
		(prev, curr) =>
			prev + curr.cards.reduce((prev, curr) => prev + `${curr.count} ${curr.name} (${curr.set_code}) ${curr.collector_number}\n`, ''),
		''
	)
})

const { copy, isSupported, copied } = useClipboard({ source: copyTextForMoxfield })

watch(
	selectedSets,
	selectedSets => {
		selectedSets.forEach(set => {
			if (!(set.code in cards.value)) {
				// To no execute again
				cards.value[set.code] = []

				cards.value[set.code] = db.getSetCards(set.id)
			}
		})
	},
	{
		deep: true
	}
)

function onSetSelected(target: HTMLInputElement) {
	const set = sets.find(set => target.value === set.code)

	if (set) {
		selectedSets.value.push({ ...set, cards: [] })

		if (includeSubsets.value) {
			addSubsets(set)
		}
	}

	target.value = ''
}

function addSubsets(set: MTGSet) {
	const subSets = sets.filter(s => s.parent_set_code === set.code)

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

function removeSelectedSet(index: number) {
	selectedSets.value.splice(index, 1)
}
</script>

<template>
	<div class="min-h-screen overflow-y-scroll grid grid-rows-[1fr_150px] items-stretch">
		<main class="container w-full">
			<input
				list="set-list"
				class="border border-black rounded"
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
			<button v-if="isSupported" class="border border-black rounded p-2" @click="copy()">
				<span v-if="!copied">Copy for Moxfield</span>
				<span v-else>Copied!</span>
			</button>
			<table>
				<thead>
					<tr>
						<th v-for="(set, i) of selectedSets" :key="set.code">
							{{ set.name }}
							<button class="i-mdi-close text-red" @click="removeSelectedSet(i)" />
						</th>
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
		</main>
		<footer class="p3">
			<p class="max-w-500px mx-auto text-center">
				Aterbonus' MTG Opener is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions
				of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
			</p>
		</footer>
	</div>
</template>
