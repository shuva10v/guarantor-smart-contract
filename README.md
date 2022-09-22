# guarantor-smart-contract

Simple proof-of-concept React application with smart contracts. Built with React, truffle, MetaMask and web3js and ganache for testing.
Smart contract is working as follows:
1. Buyer sends ETH to smart contract and money are being deposited. Buyer specifies seller and guarantor accounts.
2. Guarantor (3rd party) approves deal.
3. Seller could withdraw money.
4. Seller could refund money.

More details:
1. Smart contract code provided [here](./contracts/GuarantorDeal.sol), it contains mapping with 
all deals.
2. After deals created new event with ``dealId`` emitted.
3. All operations (``approve``, ``withdraw`` and ``refund``) are invoked by seller or guarantor with ``dealId``.

Important Note: this is just a demo dApp, and it is not intended for any usage on Ethereum mainnet.

## Build

* Run Ganache app
* ``truffle build``
* ``npm run build``
* ``npm start``

## Tests

``npm test`` to run tests in [GuarantorDeal.js](./test/GuarantorDeal.js)

## Demo

![demo](./guarantor_demo.gif)
