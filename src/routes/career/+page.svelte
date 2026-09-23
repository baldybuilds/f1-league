<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function pct(rate: number) {
		return `${Math.round(rate * 100)}%`;
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-semibold tracking-tight">Career</h1>

	<Card>
		<CardContent class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<div>
				<p class="text-muted-foreground text-xs">Seasons played</p>
				<p class="text-xl font-semibold">{data.seasonsPlayed}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-xs">Titles</p>
				<p class="text-xl font-semibold">{data.titles}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-xs">Lifetime points</p>
				<p class="text-xl font-semibold">{data.rollup.totalPoints}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-xs">Winner rate</p>
				<p class="text-xl font-semibold">{pct(data.rollup.winnerRate)}</p>
			</div>
		</CardContent>
	</Card>

	{#if data.bestSeason}
		<Alert>
			<AlertDescription>
				Best season: {data.bestSeason.leagueName}
				{data.bestSeason.year} - {data.bestSeason.totalPoints} points (rank {data.bestSeason.rank}).
			</AlertDescription>
		</Alert>
	{/if}

	{#if data.standingsRows.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Archived seasons</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col gap-2">
				{#each data.standingsRows as row (row.leagueName + row.year)}
					<div class="flex items-center justify-between text-sm">
						<span>{row.leagueName} - {row.year}</span>
						<div class="flex items-center gap-2">
							<Badge variant="outline">rank {row.rank}</Badge>
							<span class="font-semibold">{row.totalPoints} pts</span>
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>
	{:else}
		<Alert>
			<AlertDescription>No archived seasons yet.</AlertDescription>
		</Alert>
	{/if}
</div>
