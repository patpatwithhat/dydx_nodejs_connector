"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DYDXConnector = void 0;
const v3_client_1 = require("@dydxprotocol/v3-client");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../.env') });
const Web3 = require("web3");
const WebSocket = require('ws');
const HTTP_HOST_MAINNET = 'https://api.dydx.exchange';
const HTTP_HOST_ROPSTEN = 'https://api.stage.dydx.exchange';
const WS_HOST_MAINNET = 'wss://api.stage.dydx.exchange/v3/ws'; //mainnet: wss://api.dydx.exchange/v3/ws
const WS_HOST_ROPSTEN = 'wss://api.dydx.exchange/v3/ws';
const UI_URL_TESTNET = "https://trade.stage.dydx.exchange/portfolio/overview";
const UI_URL_MAINNET = "https://trade.dydx.exchange/portfolio/overview";
class DYDXConnector {
    constructor(networkId = 3 /* RopstenTestNet */, keyPair, apiCreds) {
        this._positionID = "0";
        const web3 = new Web3(process.env.MORALIS);
        //web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY)
        const host = networkId === 1 ? HTTP_HOST_MAINNET : HTTP_HOST_ROPSTEN;
        DYDXConnector._client = new v3_client_1.DydxClient(host, {
            apiTimeout: 3000,
            networkId: networkId,
            web3: web3,
            starkPrivateKey: keyPair,
            apiKeyCredentials: apiCreds
        });
    }
    get client() {
        return DYDXConnector._client;
    }
    get positionID() {
        return this._positionID;
    }
    set positionID(id) {
        this._positionID = id;
    }
    static build(networkId = 3 /* RopstenTestNet */) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            let dydxConnector;
            let keyPair;
            let apiCreds;
            if (!DYDXConnector.checkIfEthPrivateKeyPresent()) {
                if (!DYDXConnector.checkIfAllRequiredKeysPresent())
                    throw ("Your keys are not valid!");
                else {
                    keyPair = {
                        privateKey: (_a = process.env.STARK_PRIVATE_KEY) !== null && _a !== void 0 ? _a : "",
                        publicKey: (_b = process.env.STARK_PUBLIC_KEY) !== null && _b !== void 0 ? _b : "",
                        publicKeyYCoordinate: (_c = process.env.STARK_COORD) !== null && _c !== void 0 ? _c : ""
                    };
                    apiCreds = {
                        key: (_d = process.env.DYDX_API_KEY) !== null && _d !== void 0 ? _d : "",
                        passphrase: (_e = process.env.DYDX_PASSPHRASE) !== null && _e !== void 0 ? _e : "",
                        secret: (_f = process.env.DYDX_SECRET) !== null && _f !== void 0 ? _f : ""
                    };
                }
            }
            else {
                const web3 = new Web3(process.env.MORALIS);
                web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY);
                const host = networkId === 1 ? HTTP_HOST_MAINNET : HTTP_HOST_ROPSTEN;
                DYDXConnector._client = new v3_client_1.DydxClient(host, {
                    apiTimeout: 3000,
                    networkId: networkId,
                    web3: web3,
                });
                keyPair = yield DYDXConnector.getKeyPairWithYCoordinate();
                apiCreds = yield DYDXConnector.getApiCredentials();
            }
            dydxConnector = new DYDXConnector(networkId, keyPair, apiCreds);
            dydxConnector.positionID = (yield dydxConnector.getAccount()).positionId;
            return dydxConnector;
        });
    }
    static checkGeneralKeysPresent() {
        if (!DYDXConnector.checkIfEthPrivateKeyPresent()) {
            if (!DYDXConnector.checkIfAllRequiredKeysPresent())
                return false;
        }
        return true;
    }
    static checkIfAllRequiredKeysPresent() {
        let keys = [process.env.STARK_PRIVATE_KEY, process.env.STARK_PUBLIC_KEY, process.env.STARK_COORD, process.env.DYDX_API_KEY, process.env.DYDX_PASSPHRASE, process.env.DYDX_SECRET];
        for (const key in keys) {
            if (key !== undefined) {
                return true;
            }
            else {
                console.log("Keys missing");
                return false;
            }
        }
    }
    static checkIfEthPrivateKeyPresent() {
        let key = process.env.ETH_PRIVATE_KEY;
        if (key !== undefined) {
            console.log("Private Key found");
            return true;
        }
        else {
            console.log("Private Key missing");
            return false;
        }
    }
    getPNLInPercent(position) {
        return (Number(position.unrealizedPnl) * 100) / (Number(position.size) * Number(position.entryPrice));
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
    createOrder(side, type, timeInForce, postOnly = false, size, price, limitFee = '0.015', expiration = '2022-12-21T21:30:20.200Z', market) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.createOrder({
                    side,
                    type,
                    timeInForce,
                    postOnly,
                    size,
                    price,
                    limitFee,
                    expiration,
                    market,
                }, this.positionID);
                console.log("New order placed!");
                return result.order;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getPositions(market, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getPositions({
                    market: market,
                    status: status,
                });
                return result.positions;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getOrders(market, status = v3_client_1.OrderStatus.OPEN, side, type, limit = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getOrders({
                    market: market,
                    status: status,
                    side: side,
                    type: type,
                    limit: limit,
                });
                return result.orders;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getOrderById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getOrderById(id);
                return result.order;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getActiveOrder(market) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getActiveOrders(market);
                return result.orders;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    recoverInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const recovery = yield DYDXConnector._client.ethPrivate.recovery((_a = process.env.ETH_ADDRESS) !== null && _a !== void 0 ? _a : "");
            return recovery;
        });
    }
    registerNewUser(keyPair) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const onboardingInformation = yield DYDXConnector._client.onboarding.createUser({
                starkKey: keyPair.publicKey,
                starkKeyYCoordinate: keyPair.publicKeyYCoordinate,
                country: 'DE',
            }, (_a = process.env.ETH_ADDRESS) !== null && _a !== void 0 ? _a : "");
            return onboardingInformation;
        });
    }
    static getApiCredentials() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiCreds = yield DYDXConnector._client.onboarding.recoverDefaultApiCredentials((_a = process.env.ETH_ADDRESS) !== null && _a !== void 0 ? _a : "");
                return apiCreds;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    static getKeyPairWithYCoordinate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keyPairWithYCoordinate = yield DYDXConnector._client.onboarding.deriveStarkKey((_a = process.env.ETH_ADDRESS) !== null && _a !== void 0 ? _a : "");
                return keyPairWithYCoordinate;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    updateUser(email, username, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.updateUser({
                    email,
                    username,
                    isSharingAddress: false,
                    userData: {},
                    country,
                });
                return result.user;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getAccount() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getAccount((_a = process.env.ETH_ADDRESS) !== null && _a !== void 0 ? _a : "");
                return result.account;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
    getUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.private.getUser();
                return result.user;
            }
            catch (error) {
                console.log(error);
                throw (error);
            }
        });
    }
}
exports.DYDXConnector = DYDXConnector;
