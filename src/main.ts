import App from "./App.svelte";
import TOC from "./TOC.svelte";

const app = new App({
	target: document.getElementById("main"),
});
const toc = new TOC({
	target: document.getElementById("toc"),
});

export default app;
