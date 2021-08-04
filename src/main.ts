import Main from "./main/App.svelte";
import MNIST from "./MNIST/App.svelte";
import Encoder from "./diagrams/DataLoader.svelte";
import Decoder from "./diagrams/DataLoader.svelte";
import Latent from "./diagrams/DataLoader.svelte";

const main = new Main({
	target: document.getElementById("main"),
});
const mnist = new MNIST({
	target: document.getElementById("mnist"),
});
const encoder = new Encoder({
	target: document.getElementById("encoderDiagram"),
	props: {
		diagramPicker: "encoder",
	},
});
const decoder = new Decoder({
	target: document.getElementById("decoderDiagram"),
	props: {
		diagramPicker: "decoder",
	},
});
const latent = new Latent({
	target: document.getElementById("latentDiagram"),
	props: {
		diagramPicker: "latent",
	},
});

export default main;
