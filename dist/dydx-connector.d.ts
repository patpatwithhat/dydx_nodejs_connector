import { DydxClient, ApiKeyCredentials, PositionResponseObject, OrderResponseObject, Market, MarketsResponseObject, TimeInForce, OrderType, OrderSide, OrderStatus, PositionStatus, ActiveOrderResponseObject, UserResponseObject, AccountResponseObject } from "@dydxprotocol/v3-client";
import { KeyPairWithYCoordinate } from '@dydxprotocol/starkex-lib';
export declare const enum NetworkID {
    MainNet = 1,
    RopstenTestNet = 3
}
export declare class DYDXConnector {
    static _client: DydxClient;
    _positionID: string;
    private constructor();
    get client(): DydxClient;
    get positionID(): string;
    set positionID(id: string);
    static build(networkId?: NetworkID): Promise<DYDXConnector>;
    static isMoralisEntryPresent(): Boolean;
    static isEthAddressPresent(): Boolean;
    static checkGeneralKeysPresent(): Boolean;
    private static checkIfAllRequiredKeysPresent;
    private static checkIfEthPrivateKeyPresent;
    getPNLInPercent(position: PositionResponseObject): Number;
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
    createOrder(side: OrderSide, type: OrderType, timeInForce: TimeInForce, postOnly: boolean | undefined, size: string, price: string, limitFee: string | undefined, expiration: string | undefined, market: Market): Promise<OrderResponseObject>;
    getPositions(market: Market | undefined, status: PositionStatus): Promise<PositionResponseObject[]>;
    getMarkets(market?: Market | undefined): Promise<MarketsResponseObject>;
    getOrders(market: Market, status: OrderStatus | undefined, side: OrderSide, type: OrderType, limit?: number): Promise<OrderResponseObject[]>;
    getOrderById(id: string): Promise<OrderResponseObject>;
    getActiveOrder(market: Market): Promise<ActiveOrderResponseObject[]>;
    recoverInfo(): Promise<{
        starkKey: string;
    }>;
    registerNewUser(keyPair: KeyPairWithYCoordinate): Promise<{
        apiKey: ApiKeyCredentials;
        user: UserResponseObject;
        account: AccountResponseObject;
    }>;
    static getApiCredentials(): Promise<ApiKeyCredentials>;
    static getKeyPairWithYCoordinate(): Promise<KeyPairWithYCoordinate>;
    updateUser(email: string, username: string, country: string): Promise<UserResponseObject>;
    getAccount(): Promise<AccountResponseObject>;
    getUser(): Promise<UserResponseObject>;
}
