const assert = require('assert');
const KrakenApiClient = require('../../../');

describe('KrakenApiClient.generateSignature(uri, payload, nonce)', function() {

	it('example signature', function() {
		const kraken = new KrakenApiClient({
			apiKey: 'xxx',
			privateKey: 'kQH5HW/8p1uGOVjbgWA7FunAmGO8lsSUXNsu3eow76sz84Q18fWxnyRzBHCd3pd5nE9qa99HAZtuZuj6F1huXg==',
		});
		const uri = '/0/private/AddOrder';
		const payload = 'nonce=1616492376594&ordertype=limit&pair=XBTUSD&price=37500&type=buy&volume=1.25';
		const nonce = '1616492376594';
		const sig = kraken.generateSignature(uri, payload, nonce);
		const exampleSig = '4/dpxb3iT4tp/ZCVEwSnEsLxx0bqyhLpdfOpc6fn7OR8+UClSV5n9E6aSS8MPtnRfp32bAb0nmbRn6H8ndwLUQ==';
		assert.strictEqual(sig, exampleSig);
	});
});
