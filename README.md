<p align="center">
  <img width="300" height="300" src="https://www.appstorefoundation.org/img/image-appcoinsLogo.svg">
  <h1 align="center">AppCoins Project</h1>
</p>

# Contracts
Repo containing the smart contracts of the AppCoins protocol

1. [Getting started with docker](#getting-started-with-docker)
2. [Getting started](#getting-started)
3. [How to test](#how-to-test)


## Getting started with docker:

1. Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

2. Clone this repo:
```sh
$ git clone git@github.com:AppStoreFoundation/asf-contracts.git
```

3. Move to the appropriate directory:
```sh
$ cd asf-contracts
```

4. Run docker compose build (optional):
```sh
$ docker-compose build
```

5. Deploy the docker container:
```sh
$ docker-compose up
```


6. On a new terminal attach to the new docker container:
```sh
$ docker exec -it AppCoinsDev  bash
```



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

4. Create the file .env from .env.example and configure it:  
```sd
$  cp .env.example .env
```


5. Install the dependencies:  
```sd
$  npm install
```

6. Start Ganache/TestRPC
```sd
$ ganache-cli
```  

7. Deploy the contracts into the test network:  
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
