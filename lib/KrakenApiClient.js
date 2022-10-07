const assert = require('assert');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const url = require('url');

// https://docs.kraken.com/rest/

class KrakenApiClient {

	constructor(options) {
		this.config = Object.assign({}, {
			baseUrl: 'https://api.kraken.com',
			apiKey: null,
			privateKey: null,
			version: 0,
		}, options || {});
		assert.ok(this.config.baseUrl, 'Missing required configuration option: "baseUrl"');
	}

	api(method, data) {
		data = data || {};
		if (this.methods.public.includes(method)) {
			return this.publicMethod(method, data);
		}
		if (this.methods.private.includes(method)) {
			return this.privateMethod(method, data);
		}
		throw new Error(`Unknown API method: ${method}`);
	}

	publicMethod(method, data) {
		data = data || {};
		const { baseUrl, version } = this.config;
		const requestUrl = `${baseUrl}/${version}/public/${method}`;
		const headers = {};
		const payload = querystring.stringify(data);
		return this.doRequest(requestUrl, headers, payload);
	}

	privateMethod(method, data) {
		const { apiKey, baseUrl, version } = this.config;
		assert.ok(apiKey, 'Missing required configuration option: "apiKey"');
		const uri = `/${version}/private/${method}`;
		const requestUrl = `${baseUrl}${uri}`;
		data = data || {};
		data.nonce = new Date() * 1000;// spoof microseconds
		const payload = querystring.stringify(data);
		const headers = {
			'API-Key': apiKey,
			'API-Sign': this.generateSignature(uri, payload, data.nonce),
		};
		return this.doRequest(requestUrl, headers, payload);
	}

	generateSignature(uri, payload, nonce) {
		const { privateKey } = this.config;
		assert.ok(privateKey, 'Missing required configuration option: "privateKey"');
		assert.ok(uri, 'Missing required argument: "uri"');
		assert.ok(payload, 'Missing required argument: "payload"');
		assert.ok(nonce, 'Missing required argument: "nonce"');
		// HMAC-SHA512 of (URI path + SHA256(nonce + payload)) and base64 decoded secret API key
		const hash = crypto.createHash('sha256').update(`${nonce}${payload}`).digest('binary');
		return crypto.createHmac('sha512', Buffer.from(privateKey, 'base64')).update(uri + hash, 'binary').digest('base64');
	}

	doRequest(requestUrl, headers, payload) {
		return Promise.resolve().then(() => {
			headers = headers || {};
			headers['Content-Length'] = Buffer.byteLength(payload);
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
			headers['User-Agent'] = 'kraken-api-client-node';
			const parsedUrl = url.parse(requestUrl);
			let requestOptions = {
				method: 'POST',
				hostname: parsedUrl.hostname,
				port: parsedUrl.port,
				path: parsedUrl.path,
				headers,
			};
			const request = parsedUrl.protocol === 'https:' ? https.request : http.request;
			return new Promise((resolve, reject) => {
				try {
					const req = request(requestOptions, function(response) {
						let body = '';
						response.on('data', function(buffer) {
							body += buffer.toString();
						});
						response.on('end', function() {
							let json;
							if (response.headers['content-type'].substr(0, 'application/json'.length) === 'application/json') {
								try { json = JSON.parse(body); } catch (error) {
									return reject(error);
								}
							} else {
								return reject(new Error('Unexpected Response Content-Type: ' + response.headers['content-type']));
							}
							if (json.error && json.error.length > 0) {
								return reject(new Error('API Request Failed: ' + json.error.join(', ')));
							}
							resolve(json.result || null);
						});
					});
					if (payload) {
						req.write(payload);
					}
					req.once('error', reject);
					req.end();
				} catch (error) {
					return reject(error);
				}
			});
		});
	}
}

KrakenApiClient.prototype.methods = {
	public: [ 'Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC' ],
	private: [ 'Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel', 'GetWebSocketsToken' ],
};

module.exports = KrakenApiClient;
