<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();

	let resultP1 = $state('');
	let resultP2 = $state('');
	let resultP3 = $state('');
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{data.league.name}</h1>
		<p class="text-muted-foreground text-sm">
			{data.season?.year} season - {data.season?.status}
		</p>
	</div>

	{#if data.membership.status === 'pending'}
		<Alert>
			<AlertDescription>
				Your request to join this league is waiting for approval from an owner or admin.
			</AlertDescription>
		</Alert>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>Season</CardTitle>
				<CardDescription>{data.season?.year} - {data.season?.status}</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-3">
				{#if data.season?.status === 'active'}
					<Button href={resolve('/leagues/[id]/picks', { id: data.league.id })}
						>Make your pick</Button
					>
					<Button
						href={resolve('/leagues/[id]/standings', { id: data.league.id })}
						variant="outline">Standings</Button
					>
				{:else if data.isAdminOrOwner && data.season?.status === 'setup'}
					<form method="POST" action="?/activateSeason" use:enhance>
						<Button type="submit">Activate season</Button>
					</form>
					<p class="text-muted-foreground text-sm">
						Activating opens picks for members once rounds are scheduled.
					</p>
				{:else}
					<p class="text-muted-foreground text-sm">This season isn't active yet.</p>
				{/if}
			</CardContent>
		</Card>

		{#if data.isAdminOrOwner && data.roundNeedingResult}
			<Card>
				<CardHeader>
					<CardTitle
						>Enter result - Round {data.roundNeedingResult.roundNumber} - {data.roundNeedingResult
							.name}</CardTitle
					>
					<CardDescription>Locked, awaiting the finishing order for scoring.</CardDescription>
				</CardHeader>
				<CardContent>
					{#if form?.resultError}
						<Alert variant="destructive" class="mb-4">
							<AlertDescription>{form.resultError}</AlertDescription>
						</Alert>
					{:else if form?.resultSuccess}
						<Alert class="mb-4">
							<AlertDescription>Result saved and scores updated.</AlertDescription>
						</Alert>
					{/if}

					<form method="POST" action="?/enterResult" use:enhance class="flex flex-col gap-4">
						<input type="hidden" name="roundId" value={data.roundNeedingResult.id} />

						<div class="space-y-2">
							<Label for="resultP1DriverId">P1</Label>
							<Select type="single" name="p1DriverId" bind:value={resultP1}>
								<SelectTrigger id="resultP1DriverId" class="w-full">
									<SelectValue placeholder="Choose a driver" />
								</SelectTrigger>
								<SelectContent>
									{#each data.drivers as driver (driver.id)}
										<SelectItem value={driver.id}
											>{driver.code} - {driver.name} ({driver.team})</SelectItem
										>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div class="space-y-2">
							<Label for="resultP2DriverId">P2</Label>
							<Select type="single" name="p2DriverId" bind:value={resultP2}>
								<SelectTrigger id="resultP2DriverId" class="w-full">
									<SelectValue placeholder="Choose a driver" />
								</SelectTrigger>
								<SelectContent>
									{#each data.drivers as driver (driver.id)}
										<SelectItem value={driver.id}
											>{driver.code} - {driver.name} ({driver.team})</SelectItem
										>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div class="space-y-2">
							<Label for="resultP3DriverId">P3</Label>
							<Select type="single" name="p3DriverId" bind:value={resultP3}>
								<SelectTrigger id="resultP3DriverId" class="w-full">
									<SelectValue placeholder="Choose a driver" />
								</SelectTrigger>
								<SelectContent>
									{#each data.drivers as driver (driver.id)}
										<SelectItem value={driver.id}
											>{driver.code} - {driver.name} ({driver.team})</SelectItem
										>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<Button type="submit">Save result</Button>
					</form>
				</CardContent>
			</Card>
		{/if}

		<Card>
			<CardHeader>
				<CardTitle>Members</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col gap-3">
				{#each data.members ?? [] as member (member.membershipId)}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="border-border inline-block size-3 rounded-full border"
								style:background-color={member.avatarColour}
							></span>
							<span class="text-sm">{member.displayName}</span>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline">{member.role}</Badge>
							{#if member.status === 'pending'}
								<Badge variant="secondary">pending</Badge>
								{#if data.isAdminOrOwner}
									<form method="POST" action="?/approveMember" use:enhance>
										<input type="hidden" name="membershipId" value={member.membershipId} />
										<Button type="submit" size="sm" variant="outline">Approve</Button>
									</form>
								{/if}
							{/if}
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>

		{#if data.isAdminOrOwner}
			<Card>
				<CardHeader>
					<CardTitle>Invites</CardTitle>
					<CardDescription>
						Invite links are shown once when created - copy it before leaving this page.
					</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-col gap-4">
					<form method="POST" action="?/createInvite" use:enhance>
						<Button type="submit">Generate invite link</Button>
					</form>

					{#if form?.inviteUrl}
						<Alert>
							<AlertDescription class="break-all">{form.inviteUrl}</AlertDescription>
						</Alert>
					{/if}

					{#if data.invites && data.invites.length > 0}
						<Separator />
						<div class="flex flex-col gap-2">
							{#each data.invites as invite (invite.id)}
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground">
										{invite.uses}/{invite.maxUses} used - expires {new Date(
											invite.expiresAt
										).toLocaleDateString()}
										{#if invite.revokedAt}
											<Badge variant="destructive" class="ml-1">revoked</Badge>
										{/if}
									</span>
									{#if !invite.revokedAt}
										<form method="POST" action="?/revokeInvite" use:enhance>
											<input type="hidden" name="inviteId" value={invite.id} />
											<Button type="submit" size="sm" variant="ghost">Revoke</Button>
										</form>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>
