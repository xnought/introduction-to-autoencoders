<script lang="ts">
	import { onMount } from "svelte";
	import { getData } from "./app";
	import Tool from "./components/tool/Tool.svelte";

	let websiteName: string = "Autoencoder Lab";
	let dataset: dataType;

	function detectWebBrowser() {
		const isSafari =
			/constructor/i.test(window.HTMLElement) ||
			(function (p) {
				return p.toString() === "[object SafariRemoteNotification]";
			})(
				!window["safari"] ||
					(typeof safari !== "undefined" &&
						window["safari"].pushNotification)
			);
	}
	// class Dataset {
	// 	data: Point3D[];
	// 	inputColors: string[];
	// 	outputColors: string[];
	// 	constructor(data: Point3D[], colors: string[]) {
	// 		this.data = data;
	// 		this.inputColors = [];
	// 		this.outputColors = [];
	// 	}
	// 	clusterColors(colors: string[]) {
	// 		const fraction = Math.ceil(colors.length);
	// 		for(let i = 0; i < this.data.length; i++) {
	// 			this.inputColors.push(c)
	// 		}
	// 	}
	// 	scaleColors() {
	// 	}
	// }

	const dataSetNames = ["donut.json", "clusters.json"];
	let datasets: any[] = [];
	let loaded = false;
	onMount(async () => {
		for (const dsn of dataSetNames) {
			const data = await getData(dsn);
			datasets.push(data);
		}
		loaded = true;
		console.log(datasets);
	});
</script>

<svelte:head>
	<title>{websiteName}</title>
</svelte:head>
<div id="main-tool">
	{#if loaded}
		<Tool dataset={datasets[0]} />
	{:else}
		<h1>Loading</h1>
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
		height: 800px;
		// border: 1px solid black;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}
</style>
