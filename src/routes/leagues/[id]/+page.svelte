<script lang="ts">
	import { enhance } from '$app/forms';
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
	import { Separator } from '$lib/components/ui/separator';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
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
