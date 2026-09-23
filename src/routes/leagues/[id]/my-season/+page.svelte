<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const driverById = $derived(new Map((data.driverRows ?? []).map((d) => [d.id, d])));

	function driverLabel(id: string | null) {
		if (!id) return 'Unknown';
		const driver = driverById.get(id);
		return driver ? `${driver.code}` : 'Unknown';
	}

	function pct(rate: number) {
		return `${Math.round(rate * 100)}%`;
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-semibold tracking-tight">My season</h1>

	{#if !data.season}
		<Alert>
			<AlertDescription>No season found for this league yet.</AlertDescription>
		</Alert>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>{data.season.year} season</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div>
					<p class="text-muted-foreground text-xs">Rank</p>
					<p class="text-xl font-semibold">{data.rank ?? '-'}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Total points</p>
					<p class="text-xl font-semibold">
						{data.frozenStanding?.totalPoints ?? data.rollup?.totalPoints ?? 0}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Rounds scored</p>
					<p class="text-xl font-semibold">{data.rollup?.roundsScored ?? 0}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Winner rate</p>
					<p class="text-xl font-semibold">{pct(data.rollup?.winnerRate ?? 0)}</p>
				</div>
			</CardContent>
		</Card>

		{#if data.frozenStanding}
			<Alert>
				<AlertDescription>
					Season archived - final standing: {data.frozenStanding.regularPoints} regular + {data
						.frozenStanding.wdcBonus} WDC + {data.frozenStanding.wccBonus} WCC = {data
						.frozenStanding.totalPoints} points.
				</AlertDescription>
			</Alert>
		{/if}

		{#if data.rollup && data.rollup.roundsScored > 0}
			<Card>
				<CardHeader>
					<CardTitle>Accuracy</CardTitle>
				</CardHeader>
				<CardContent class="grid grid-cols-3 gap-4">
					<div>
						<p class="text-muted-foreground text-xs">Podium rate</p>
						<p class="font-semibold">{pct(data.rollup.podiumRate)}</p>
					</div>
					<div>
						<p class="text-muted-foreground text-xs">Exact position rate</p>
						<p class="font-semibold">{pct(data.rollup.exactRate)}</p>
					</div>
					<div>
						<p class="text-muted-foreground text-xs">Winner rate</p>
						<p class="font-semibold">{pct(data.rollup.winnerRate)}</p>
					</div>
				</CardContent>
				{#if data.rollup.bestRound || data.rollup.worstRound}
					<Separator />
					<CardContent class="flex flex-col gap-1 text-sm">
						{#if data.rollup.bestRound}
							<p>
								Best round: round {data.rollup.bestRound.roundNumber} ({data.rollup.bestRound
									.points} pts)
							</p>
						{/if}
						{#if data.rollup.worstRound}
							<p>
								Worst round: round {data.rollup.worstRound.roundNumber} ({data.rollup.worstRound
									.points} pts)
							</p>
						{/if}
					</CardContent>
				{/if}
			</Card>
		{/if}

		{#if data.pickRows && data.pickRows.length > 0}
			<Card>
				<CardHeader>
					<CardTitle>Picks vs. results</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					{#each data.pickRows as pick (pick.roundNumber)}
						<div class="flex items-center justify-between text-sm">
							<span>
								Round {pick.roundNumber} - {pick.roundName}: your pick {driverLabel(
									pick.p1DriverId
								)}/{driverLabel(pick.p2DriverId)}/{driverLabel(pick.p3DriverId)}
							</span>
							{#if pick.resultP1Id}
								<Badge variant="outline">
									result {driverLabel(pick.resultP1Id)}/{driverLabel(pick.resultP2Id)}/{driverLabel(
										pick.resultP3Id
									)}
								</Badge>
							{:else}
								<Badge variant="secondary">not scored yet</Badge>
							{/if}
						</div>
					{/each}
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>
