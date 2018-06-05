# Contracts
Repo containing the smart contracts of the AppCoins protocol

## Getting started:

1. This project has a few pre-installation dependencies.
- [Node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [Truffle](https://github.com/trufflesuite/truffle)
- [Ganache-cli](https://github.com/trufflesuite/ganache-cli)

2. Clone this repo using git clone git@github.com:AppStoreFoundation/asf-contracts.git

3. Move to the appropriate directory:
```sh
$ cd asf-contracts
```

4. Install the dependencies:  
```sd
$  npm install
```

5. Start Ganache/TestRPC
```sd
$ ganache-cli
```  

6. Deploy the contracts into the test network:  
```sd
$  truffle deploy --reset
```

Now you are ready to start using the contracts.

## How to test:

1. Configure the project [see getting started](https://github.com/AppStoreFoundation/asf-contracts#getting-started).

2. Use the command:  
```sd
$ truffle test
```  
