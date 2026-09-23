<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-semibold tracking-tight">Standings</h1>

	{#if !data.season}
		<Alert>
			<AlertDescription>This league's season hasn't been activated yet.</AlertDescription>
		</Alert>
	{:else if data.standings.length === 0}
		<Alert>
			<AlertDescription>No rounds have been scored yet.</AlertDescription>
		</Alert>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>{data.season.year} season{data.archived ? ' - archived' : ''}</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col gap-3">
				{#if data.archived}
					{#each data.standings as row (row.userId)}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Badge variant="outline">{row.rank}</Badge>
								<span
									class="border-border inline-block size-3 rounded-full border"
									style:background-color={row.avatarColour}
								></span>
								<span class="text-sm">{row.displayName}</span>
							</div>
							<span class="text-sm font-semibold">{row.totalPoints} pts</span>
						</div>
					{/each}
				{:else}
					{#each data.standings as row, i (row.userId)}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Badge variant="outline">{i + 1}</Badge>
								<span
									class="border-border inline-block size-3 rounded-full border"
									style:background-color={row.avatarColour}
								></span>
								<span class="text-sm">{row.displayName}</span>
							</div>
							<div class="flex items-center gap-3 text-sm">
								<span class="text-muted-foreground">{row.roundsScored} rounds</span>
								<span class="font-semibold">{row.totalPoints} pts</span>
							</div>
						</div>
					{/each}
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>
