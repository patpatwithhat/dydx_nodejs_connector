import { DydxClient, ApiKeyCredentials, PositionResponseObject, OrderResponseObject, Market, TimeInForce, OrderType, OrderSide, OrderStatus, PositionStatus, ActiveOrderResponseObject, UserResponseObject, AccountResponseObject } from "@dydxprotocol/v3-client";

import {
    KeyPairWithYCoordinate,
    keyPairFromData,
} from '@dydxprotocol/starkex-lib';

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../.env') })


const Web3 = require("web3");
const WebSocket = require('ws')


const HTTP_HOST_MAINNET = 'https://api.dydx.exchange'
const HTTP_HOST_ROPSTEN = 'https://api.stage.dydx.exchange'
const WS_HOST_MAINNET = 'wss://api.stage.dydx.exchange/v3/ws' //mainnet: wss://api.dydx.exchange/v3/ws
const WS_HOST_ROPSTEN = 'wss://api.dydx.exchange/v3/ws'


const UI_URL_TESTNET = "https://trade.stage.dydx.exchange/portfolio/overview"
const UI_URL_MAINNET = "https://trade.dydx.exchange/portfolio/overview"

export const enum NetworkID {
    MainNet = 1,
    RopstenTestNet = 3
}

export class DYDXConnector {

    static _client: DydxClient
    _positionID: string = "0"

    private constructor(
        networkId: NetworkID = NetworkID.RopstenTestNet,
        keyPair: KeyPairWithYCoordinate,
        apiCreds: ApiKeyCredentials
    ) {
        const web3 = new Web3(process.env.MORALIS)
        //web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY)

        const host = networkId === 1 ? HTTP_HOST_MAINNET : HTTP_HOST_ROPSTEN
        DYDXConnector._client = new DydxClient(
            host,
            {
                apiTimeout: 3000,
                networkId: networkId,
                web3: web3,

                starkPrivateKey: keyPair,
                apiKeyCredentials: apiCreds
            }

        );
    }

    public get client(): DydxClient {
        return DYDXConnector._client
    }

    public get positionID(): string {
        return this._positionID
    }

    public set positionID(id: string) {
        this._positionID = id
    }


    static async build(
        networkId: NetworkID = NetworkID.RopstenTestNet,
    ): Promise<DYDXConnector> {
        let dydxConnector: DYDXConnector
        let keyPair: KeyPairWithYCoordinate
        let apiCreds: ApiKeyCredentials
        if (!DYDXConnector.checkIfEthPrivateKeyPresent()) {
            if (!DYDXConnector.checkIfAllRequiredKeysPresent()) throw ("Your keys are not valid!")
            else {
                keyPair = {
                    privateKey: process.env.STARK_PRIVATE_KEY ?? "",
                    publicKey: process.env.STARK_PUBLIC_KEY ?? "",
                    publicKeyYCoordinate: process.env.STARK_COORD ?? ""
                }
                apiCreds = {
                    key: process.env.DYDX_API_KEY ?? "",
                    passphrase: process.env.DYDX_PASSPHRASE ?? "",
                    secret: process.env.DYDX_SECRET ?? ""
                }
            }

        } else {
            const web3 = new Web3(process.env.MORALIS)
            web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY)

            const host = networkId === 1 ? HTTP_HOST_MAINNET : HTTP_HOST_ROPSTEN
            DYDXConnector._client = new DydxClient(
                host,
                {
                    apiTimeout: 3000,
                    networkId: networkId,
                    web3: web3,
                }
            );

            keyPair = await DYDXConnector.getKeyPairWithYCoordinate()
            apiCreds = await DYDXConnector.getApiCredentials()
        }
        dydxConnector = new DYDXConnector(networkId, keyPair, apiCreds)
        dydxConnector.positionID = (await dydxConnector.getAccount()).positionId

        return dydxConnector

    }

    public static checkGeneralKeysPresent() {
        if (!DYDXConnector.checkIfEthPrivateKeyPresent()) {
            if (!DYDXConnector.checkIfAllRequiredKeysPresent()) return false
        }
        return true
    }

    private static checkIfAllRequiredKeysPresent() {
        let keys = [process.env.STARK_PRIVATE_KEY, process.env.STARK_PUBLIC_KEY, process.env.STARK_COORD, process.env.DYDX_API_KEY, process.env.DYDX_PASSPHRASE, process.env.DYDX_SECRET]

        for (const key in keys) {
            if (key !== undefined) {
                return true
            } else {
                console.log("Keys missing")
                return false
            }
        }
    }

    private static checkIfEthPrivateKeyPresent() {
        let key = process.env.ETH_PRIVATE_KEY
        if (key !== undefined) {
            console.log("Private Key found")
            return true
        } else {
            console.log("Private Key missing")
            return false
        }
    }

    public getPNLInPercent(position: PositionResponseObject): Number {
        return (Number(position.unrealizedPnl) * 100) / (Number(position.size) * Number(position.entryPrice))
    }

    /**
     * 
     * @param side BUY, SELL
     * @param type  LIMIT, MARKET, STOP_LIMIT, TRAILING_STOP, TAKE_PROFIT
     * @param timeInForce GTT, FOK, IOC"
     * @param postOnly best to keep at false, dunno what this is doing
     * @param size of token
     * @param price you want to buy for
     * @param limitFee 
     * @param expiration date of your order
     * @param market DydxMarketEnum e.g. BTC_USD 
     * @returns Promise<dydx.OrderResponseObject> 
     */
    public async createOrder(
        side: OrderSide,
        type: OrderType,
        timeInForce: TimeInForce,
        postOnly: boolean = false,
        size: string,
        price: string,
        limitFee: string = '0.015',
        expiration: string = '2022-12-21T21:30:20.200Z',
        market: Market,

    ): Promise<OrderResponseObject> {
        try {
            const result: { order: OrderResponseObject } = await this.client.private.createOrder(
                {
                    side,
                    type,
                    timeInForce,
                    postOnly,
                    size,
                    price,
                    limitFee,
                    expiration,
                    market,
                },
                this.positionID
            );
            console.log("New order placed!")
            return result.order
        } catch (error) {
            console.log(error)
            throw (error)
        }

    }

    public async getPositions(
        market: Market,
        status: PositionStatus
    ): Promise<PositionResponseObject[]> {
        try {
            const result = await this.client.private.getPositions(
                {
                    market: market,
                    status: status,
                },
            );
            return result.positions
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }


    public async getOrders(
        market: Market,
        status: OrderStatus = OrderStatus.OPEN,
        side: OrderSide,
        type: OrderType,
        limit: number = 50): Promise<OrderResponseObject[]> {

        try {
            const result: { orders: OrderResponseObject[] } = await this.client.private.getOrders(
                {
                    market: market,
                    status: status,
                    side: side,
                    type: type,
                    limit: limit,
                },
            );
            return result.orders
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async getOrderById(id: string): Promise<OrderResponseObject> {
        try {
            const result: { order: OrderResponseObject } = await this.client.private.getOrderById(id);
            return result.order
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async getActiveOrder(market: Market): Promise<ActiveOrderResponseObject[]> {
        try {
            const result: { orders: ActiveOrderResponseObject[], } = await this.client.private.getActiveOrders(market);
            return result.orders
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async recoverInfo() {
        const recovery: {
            starkKey: string
        } = await DYDXConnector._client.ethPrivate.recovery(
            process.env.ETH_ADDRESS ?? "",
        );

        return recovery
    }

    public async registerNewUser(keyPair: KeyPairWithYCoordinate) {
        const onboardingInformation: {
            apiKey: ApiKeyCredentials,
            user: UserResponseObject,
            account: AccountResponseObject,
        } = await DYDXConnector._client.onboarding.createUser(
            {
                starkKey: keyPair.publicKey,
                starkKeyYCoordinate: keyPair.publicKeyYCoordinate,
                country: 'DE',
            },
            process.env.ETH_ADDRESS ?? "",
        );

        return onboardingInformation
    }

    public static async getApiCredentials(): Promise<ApiKeyCredentials> {
        try {
            const apiCreds = await DYDXConnector._client.onboarding.recoverDefaultApiCredentials(
                process.env.ETH_ADDRESS ?? "")

            return apiCreds;
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public static async getKeyPairWithYCoordinate(): Promise<KeyPairWithYCoordinate> {
        try {
            const keyPairWithYCoordinate: KeyPairWithYCoordinate = await DYDXConnector._client.onboarding.deriveStarkKey(
                process.env.ETH_ADDRESS ?? "",
            );

            return keyPairWithYCoordinate;
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async updateUser(email: string, username: string, country: string): Promise<UserResponseObject> {
        try {
            const result: { user: UserResponseObject } = await this.client.private.updateUser({
                email,
                username,
                isSharingAddress: false,
                userData: {},
                country,
            });
            return result.user;
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async getAccount(): Promise<AccountResponseObject> {
        try {
            const result: { account: AccountResponseObject } = await this.client.private.getAccount(
                process.env.ETH_ADDRESS ?? "",
            );
            return result.account
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }

    public async getUser(): Promise<UserResponseObject> {
        try {
            const result: { user: UserResponseObject } = await this.client.private.getUser();
            return result.user
        }
        catch (error) {
            console.log(error)
            throw (error)
        }
    }
}
