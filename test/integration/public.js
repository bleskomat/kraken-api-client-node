const assert = require('assert');
const KrakenApiClient = require('../../');

describe('public', function() {

	it('Ticker', function() {
		const kraken = new KrakenApiClient();
		const pair = 'XXBTZEUR';
		return kraken.api('Ticker', { pair }).then(result => {
			assert.strictEqual(typeof result, 'object');
			assert.ok(result[pair]);
			assert.strictEqual(typeof result[pair], 'object');
			const { a, b } = result[pair];
			assert.ok(Array.isArray(a));
			assert.ok(Array.isArray(b));
		});
	});
});
