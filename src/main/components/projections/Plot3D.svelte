<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import { schemeCategory10 } from "d3";
	export let data3D;
	// import { ScatterGL } from "camerahelperscattergl";
	interface IpointConfig {
		scaleDefault?: number;
		scaleHover?: number;
		colorHover?: string;
	}

	// config
	export let pointConfig: IpointConfig;
	export let width = "250px";
	export let height = "250px";
	export let zoom = 0.6;
	export let axesVisible = false;
	export let style = "";
	export let isOrbiting = false;
	export let colorIndices: string[];
	export let orbitOnStart = false;

	const dispatch = createEventDispatcher();
	let container: HTMLElement;
	let scatterGL;
	export let hoveredPointIndex = -1;

	function handleMouseout() {
		dispatch("hover", -1);
	}
	const toggleOrbit = () => {
		isOrbiting = true;
		scatterGL.startOrbitAnimation();
	};
	export let pos: [number, number, number] = [0.45, 0.9, 1.6];
	let mounted = false;
	onMount(async () => {
		const dataset = {
			dimensions: 3,
			points: data3D,
			metadata: [],
		};
		scatterGL = new ScatterGL(container, {
			camera: { zoom, position: pos },
			styles: {
				fog: { enabled: false },
				point: pointConfig,
				// point: {
				// 	scaleDefault,
				// 	scaleHover: 1.5,
				// 	colorHover: "rgba(0,0,0,0.2)",
				// },
				axesVisible,
			},
			selectEnabled: false,
			rotateOnStart: orbitOnStart,
			onHover: (d) => {
				if (d === null || d === hoveredPointIndex) return;
				dispatch("hover", d);
			},
		});
		window["scatterGLObj"] = scatterGL;
		scatterGL.setPointColorer((i) => {
			const colorIndex = colorIndices[i];
			return colorIndex;
		});
		//@ts-ignore
		scatterGL.render(dataset);
		mounted = true;
	});
	// const origin: [number, number, number] = [0, 0, 0];
	$: {
		if (mounted) {
			const dataset = {
				dimensions: 3,
				points: data3D,
				metadata: [],
			};
			scatterGL.updateDataset(dataset);
			scatterGL.setHoverPointIndex(hoveredPointIndex);
		}
	}
	// $: {
	// 	if (mounted) {
	// 		scatterGL.setCameraPositionAndTarget(pos, origin);
	// 	}
	// }
	// afterUpdate(() => {
	// 	const dataset = {
	// 		dimensions: 3,
	// 		points: data3D,
	// 		metadata: [],
	// 	};
	// 	//@ts-ignore
	// 	// scatterGL.scatter
	// });
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	class="container"
	on:mouseout={handleMouseout}
	style="width: {width}; height: {height};{style}"
>
	<div class="scatter-gl-container" bind:this={container} />
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		position: relative;
	}
	.scatter-gl-container {
		width: 100%;
		min-height: 100%;
	}
</style>
