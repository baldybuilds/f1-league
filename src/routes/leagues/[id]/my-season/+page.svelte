<script lang="ts">
	import LeagueNav from '$lib/components/league-nav.svelte';
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

	function driverColor(id: string | null) {
		if (!id) return '#3A3F46';
		return driverById.get(id)?.teamColor ?? '#3A3F46';
	}

	function pct(rate: number) {
		return `${Math.round(rate * 100)}%`;
	}
</script>

<div class="flex flex-col gap-6">
	<LeagueNav
		leagueId={data.leagueId}
		leagueName={data.leagueName}
		seasonStatus={data.seasonStatus}
		activePage="my-season"
	/>

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
						<div class="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
								<span class="text-muted-foreground"
									>Round {pick.roundNumber} - {pick.roundName}: your pick</span
								>
								{#each [pick.p1DriverId, pick.p2DriverId, pick.p3DriverId] as driverId (driverId)}
									<span class="inline-flex items-center gap-1">
										<span
											class="inline-block size-2 shrink-0 rounded-full"
											style:background-color={driverColor(driverId)}
										></span>
										{driverLabel(driverId)}
									</span>
								{/each}
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
