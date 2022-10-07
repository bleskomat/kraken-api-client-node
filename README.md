# KrakenApiClient

Node.js client for the Kraken bitcoin exchange API.

* [Installation](#installation)
* [Usage](#usage)
* [Tests](#tests)
* [Changelog](#changelog)
* [License](#license)


## Installation

Add to your application via `npm`:
```bash
npm install @bleskomat/kraken-api-client
```


## Usage

Public API end-points:
```js
const KrakenApiClient = require('@bleskomat/kraken-api-client');

const kraken = new KrakenApiClient();

kraken.api('Ticker').then(result => {
	console.log(JSON.stringify(result, null, 2));
}).catch(error => console.error(error));
```

Private API end-points require API key and private key:
```js
const KrakenApiClient = require('@bleskomat/kraken-api-client');

const kraken = new KrakenApiClient({
	apiKey: 'API_KEY',
	privateKey: 'PRIVATE_KEY',
});

kraken.api('Balance').then(result => {
	console.log(JSON.stringify(result, null, 2));
}).catch(error => console.error(error));
```


## Tests

Run automated tests as follows:
```bash
npm test
```


## Changelog

See [CHANGELOG.md](https://github.com/bleskomat/kraken-api-client-node/blob/master/CHANGELOG.md)


## License

This software is [MIT licensed](https://tldrlegal.com/license/mit-license):
> A short, permissive software license. Basically, you can do whatever you want as long as you include the original copyright and license notice in any copy of the software/source.  There are many variations of this license in use.
