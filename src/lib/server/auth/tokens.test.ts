import { describe, expect, it } from 'vitest';
import { generateToken, hashToken } from './tokens';

describe('generateToken', () => {
	it('produces a token whose hash matches hashToken', () => {
		const { token, hash } = generateToken();
		expect(hashToken(token)).toBe(hash);
	});

	it('produces unique tokens on each call', () => {
		const a = generateToken();
		const b = generateToken();
		expect(a.token).not.toBe(b.token);
		expect(a.hash).not.toBe(b.hash);
	});

	it('produces a 256-bit token (32 random bytes)', () => {
		const { token } = generateToken();
		const decoded = Buffer.from(token, 'base64url');
		expect(decoded.byteLength).toBe(32);
	});
});

describe('hashToken', () => {
	it('is deterministic', () => {
		expect(hashToken('same-input')).toBe(hashToken('same-input'));
	});

	it('produces a 64-character hex SHA-256 digest', () => {
		expect(hashToken('anything')).toMatch(/^[0-9a-f]{64}$/);
	});

	it('differs for different inputs', () => {
		expect(hashToken('a')).not.toBe(hashToken('b'));
	});
});
