<script lang="ts">
	/* Put stuff here */
</script>

<div class="container">
	<div class="input" />
	<div class="encoder" />
	<div class="latent" />
	<div class="decoder" />
	<div class="output" />
</div>

<style lang="scss">
	$outline: 1px solid black;

	.container {
		position: relative;
		width: 794px;
		height: 196px;
		border: $outline;

		.input {
			position: absolute;
			width: 165px;
			height: 165px;
			left: 19px;
			top: 15px;

			border: $outline;
			box-sizing: border-box;
		}
		.encoder {
			position: absolute;
			width: 141px;
			height: 165px;
			left: 199px;
			top: 15px;

			border: $outline;
			box-sizing: border-box;
		}
		.latent {
			position: absolute;
			width: 81px;
			height: 81px;
			left: 357px;
			top: 57px;

			border: $outline;
			box-sizing: border-box;
		}
		.decoder {
			position: absolute;
			width: 142px;
			height: 165px;
			left: 455px;
			top: 15px;

			border: $outline;
			box-sizing: border-box;
			transform: matrix(-1, 0, 0, 1, 0, 0);
		}
		.output {
			position: absolute;
			width: 165px;
			height: 165px;
			left: 611px;
			top: 15px;

			border: $outline;
			box-sizing: border-box;
		}
	}
</style>
