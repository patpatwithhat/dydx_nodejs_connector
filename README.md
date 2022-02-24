# DYDX NodeJS Connector

Hey there!
This project is wip.
It provides one DYDXConnector class, handling the communication with the dydx API and providing some convenience in usage <br>
Not all functionality is included yet! <br>

Later the goal will be, to implement different trading strategies for everyone to use. <br>
This will take place in the following project: https://github.com/patpatwithhat/algo_trading_strategies <br>

# How to start
```
npm init -y
npm i dydx_nodejs_connector
npm install ts-node (needed for running)
```
Provide all required keys / paths in a .env file. (check .env-template for format)<br> 
Eighter add your private eth key or enter your starkkeys for dydx.<br>

# Retrieving Starkkeys / API Keys
To retrieve starkkey/api key of dydx, do the following: <br>
* Connect your metamask with dydx (https://trade.stage.dydx.exchange/). Turn on the checkbox "remember me"
* Inspect the webpage with F12
* Go to app>local storage>https://trade.stage.dydx.exchange/
* Find stark key and api keys to copy all into the .env 

# Get your Ethereum node
In addition, you need an Ethereum node like https://moralis.io/, which needs to be entered into the .env<br>
The last step is to copy the ETH Address of your metamask wallet into the .env<br>

# Run example
### First, try to get an account object to check if you provided all the necessary data.
```
import { DYDXConnector, NetworkID } from 'dydx_nodejs_connector'

async function main() {
    const connector = await DYDXConnector.build(NetworkID.RopstenTestNet)
    console.log(await connector.getAccount())    
}
main()
```
run with: ```node --loader ts-node/esm .\index.ts```
### Place a first order on ropsten test net:
```
import { DYDXConnector, NetworkID } from 'dydx_nodejs_connector'
import { OrderSide, OrderType, TimeInForce, Market } from "@dydxprotocol/v3-client"

async function main() {
    const connector = await DYDXConnector.build(NetworkID.RopstenTestNet)
    connector.createOrder(
        OrderSide.BUY,
        OrderType.MARKET,
        TimeInForce.IOC,
        undefined,
        "0.2",
        "10000",
        undefined,
        undefined,
        Market.ETH_USD
    )
}
main()
```
Check your order here: https://trade.stage.dydx.exchange

# Security
The potential security vulnerabilities in the dependencies are known but remain on dydx side. <br>
Fixing this could lead to new problems in the dydx API.


# Sources:
DYDX https://trade.stage.dydx.exchange/<br>
DYDX Docu: https://docs.dydx.exchange/
