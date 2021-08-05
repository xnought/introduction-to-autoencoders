<script lang="ts">
	import { onMount } from "svelte";
	import { getData } from "./app";
	import Tool from "./components/tool/Tool.svelte";

	const datasetNames = ["circle", "sin", "spiral", "twistedcubic"];
	let datasets: any[] = [];
	let loaded = false;
	onMount(async () => {
		for (const dsn of datasetNames) {
			const data = await getData(dsn + ".json");
			datasets.push(data);
		}
		loaded = true;
	});
</script>

<div id="main-tool">
	{#if loaded}
		<Tool {datasets} {datasetNames} />
	{/if}
</div>

<style lang="scss">
	// @media (min-width: 640px) {
	// 	main {
	// 		max-width: none;
	// 	}
	// }
	#main-tool {
		// position: relative;
		// height: 800px;
		// border: 1px solid black;
		// border-top: 1px solid rgba(0, 0, 0, 0.1);
	}
</style>
