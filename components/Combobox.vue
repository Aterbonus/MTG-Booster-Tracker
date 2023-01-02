<script lang="ts" setup>
import type { VList, VTextField } from 'vuetify/components'

export interface Item<T> {
	value: T
	title: undefined | string
}

const props = withDefaults(
	defineProps<{
		items: unknown[]
		maxShownItems?: number
		title?: string
		value?: string
		titleFunc?: (item: unknown, index: number) => string
		label?: string
	}>(),
	{
		maxShownItems: 5,
		title: 'title',
		value: undefined,
		titleFunc: undefined,
		label: undefined
	}
)

const emit = defineEmits<{
	(e: 'change', item: Item<unknown>): void
}>()

const search = ref('')
const showMenu = ref(false)

const textFieldRef = ref<VTextField | null>(null)
const listRef = ref<VList | null>(null)

const allItems = computed(() => {
	return props.items.map((item, index) => {
		if (typeof item === 'string') {
			return {
				value: item,
				title: props.titleFunc ? props.titleFunc(item, index) : item
			}
		}

		return {
			value: props.value && typeof item === 'object' ? (item as any)?.[props.value] ?? item : item,
			title: props.titleFunc ? props.titleFunc(item, index) : (item as any)?.[props.title]
		}
	})
})

const filteredItems = computed(() => {
	const items: Item<unknown>[] = []
	const s = search.value?.trim().toLowerCase()

	if (!s) {
		return []
	}

	for (const item of allItems.value) {
		if (item.title.toLowerCase().includes(s)) {
			items.push(item)
		}

		if (items.length > props.maxShownItems) {
			break
		}
	}

	return items
})

function onItemSelect(item: unknown) {
	search.value = ''
	emit('change', item as Item<unknown>)

	nextTick(() => {
		showMenu.value = false
		textFieldRef.value?.focus()
	})
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'ArrowDown') {
		e.preventDefault()
		listRef.value?.focus('next')
	} else if (e.key === 'ArrowUp') {
		e.preventDefault()
		listRef.value?.focus('prev')
	}
}

watch(search, val => {
	if (val) {
		showMenu.value = true
	} else {
		showMenu.value = false
	}
})
</script>

<template>
	<div>
		<v-text-field ref="textFieldRef" v-model="search" :label="label" hide-details variant="solo" @keydown="onKeydown" />
		<v-menu
			v-model="showMenu"
			location="bottom"
			min-width="0"
			max-width="500"
			:open-on-click="false"
			:close-on-content-click="false"
			activator="parent"
		>
			<v-list ref="listRef">
				<v-list-item v-for="(item, i) of filteredItems" :key="i" :value="item" @click="onItemSelect(item)">
					{{ item.title }}
				</v-list-item>
			</v-list>
		</v-menu>
	</div>
</template>
