import Main from "./main/App.svelte";
import MNIST from "./MNIST/App.svelte";

const main = new Main({
	target: document.getElementById("main"),
});
const mnist = new MNIST({
	target: document.getElementById("mnist"),
});

export default main;
