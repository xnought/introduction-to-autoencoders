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

	onMount(async () => {
		dataset = await getData("donut.json");
	});
</script>

<svelte:head>
	<title>{websiteName}</title>
</svelte:head>
<div id="main-tool">
	{#if dataset}
		<Tool {dataset} />
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
		height: 600px;
		border: 1px solid black;
	}
</style>
