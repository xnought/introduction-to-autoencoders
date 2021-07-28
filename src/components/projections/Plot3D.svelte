<script lang="ts">
	import {
		onMount,
		afterUpdate,
		createEventDispatcher,
		beforeUpdate,
	} from "svelte";
	import { schemeCategory10 } from "d3";
	import { Point3D, ScatterGL } from "camerahelperscattergl";
	export let data3D;

	// config
	export let colors = schemeCategory10.slice(0, 2);
	export let lenData = 156;
	export let width = "250px";
	export let height = "250px";
	export let zoom = 0.9;
	export let scaleDefault = 1;
	export let axesVisible = true;
	export let style = "";
	export let isOrbiting = false;

	const dispatch = createEventDispatcher();
	let container: HTMLElement;
	let scatterGL: ScatterGL;
	// export let colorIndices;
	export let title = "";
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
				point: {
					scaleDefault,
					scaleHover: 3.5,
					colorHover: "rgba(0,0,0,1)",
				},
				axesVisible,
			},
			selectEnabled: false,
			rotateOnStart: false,
			onCameraDrag: (pos, target) => {
				dispatch("drag", { position: pos });
				if (isOrbiting) isOrbiting = false;
			},
			onHover: (d) => {
				if (d === null || d === hoveredPointIndex) return;
				dispatch("hover", d);
			},
		});
		window["scatterGLObj"] = scatterGL;
		scatterGL.setPointColorer((i) => {
			// const colorIndex = colorIndices[i];
			return i < lenData ? colors[0] : colors[1];
		});
		//@ts-ignore
		scatterGL.render(dataset);
		mounted = true;
	});
	const origin: Point3D = [0, 0, 0];
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
	$: {
		if (mounted) {
			scatterGL.setCameraPositionAndTarget(pos, origin);
		}
	}
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
	<!-- {#if title}
		<div class="title">{title}</div>
	{/if} -->
	<div class="scatter-gl-container" bind:this={container} />
	<!-- {#if !isOrbiting}
		<div class="orbit" on:click={toggleOrbit}>
			<i class="material-icons">3d_rotation</i>
		</div>
	{/if} -->
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		/* margin-bottom: 20px; */
		position: relative;
	}
	.scatter-gl-container {
		width: 100%;
		min-height: 90%;
	}
	/* @media only screen and (max-width: 800px) {
		.container {
			width: 100%;
			margin-bottom: 0;
		}
		.scatter-gl-container {
			min-height: 300px;
		}
	} */
	.title {
		text-align: center;
		width: 100%;
		font-weight: bold;
	}
	.orbit {
		position: absolute;
		bottom: 0;
		left: 0;
		cursor: pointer;
	}
	.orbit:hover {
		color: #333;
	}
</style>
