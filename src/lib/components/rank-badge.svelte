<script lang="ts">
	let { rank }: { rank: number } = $props();

	const podiumStyle: Record<number, string> = {
		1: 'background: linear-gradient(180deg, #ffd670, #ffb020); color: #0b0d10;',
		2: 'background: linear-gradient(180deg, #e3e7ec, #b9bfc7); color: #0b0d10;',
		3: 'background: linear-gradient(180deg, #d79a63, #b0713a); color: #0b0d10;'
	};
</script>

<div
	class="font-display inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black"
	style={podiumStyle[rank] ?? 'background: #21252b; border: 1px solid #2e333a; color: #c6cad1;'}
>
	{rank}
</div>
