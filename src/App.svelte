<script lang="ts">
	import { onMount } from "svelte";
	import { getData } from "./app";
	import Tool from "./components/tool/Tool.svelte";

	let websiteName: string = "Autoencoder Lab";
	let dataset: dataType;

	onMount(async () => {
		dataset = await getData("donut.json");
	});
</script>

<svelte:head>
	<title>{websiteName}</title>
</svelte:head>
<main>
	{#if dataset}
		<Tool {dataset} />
	{:else}
		<h1>Loading</h1>
	{/if}
</main>

<style lang="scss">
	// @media (min-width: 640px) {
	// 	main {
	// 		max-width: none;
	// 	}
	// }
</style>
