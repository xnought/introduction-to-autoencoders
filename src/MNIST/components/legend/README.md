# Legend

The directory holds all legends. Currently there is only one horizontal legend. Documentation on these are located
in the `README.md` in the components directory, or look below.

## This creates a simple legend that can be used for multiple use cases.

```javascript
import * as d3 from "d3";
import Legend from "@legend/Legend.svelte";
```

1. REQUIRED PROPS: `data`(array of nums), `scheme`(color scheme), `scale`(scale type)
2. OPTIONAL PROPS:
   `width`
   `height`
   `marginTop`
   `marginRight`
   `marginBottom`
   `marginLeft`
   `tickSize`
   `tickFormat`

```jsx
<Legend
	title="Legend Title"
	data={[0, 1]}
	scale={d3.scaleSequential}
	scheme={d3.interpolateBlues}
/>
```
