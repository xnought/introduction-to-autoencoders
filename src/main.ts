import App from "./App.svelte";
import Test from "./Test.svelte";

const app = new App({
	target: document.getElementById("main"),
});
const test = new Test({
	target: document.getElementById("test"),
});

export default app;
