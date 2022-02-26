import { DYDXConnector, NetworkID } from './src/dydx-connector' //should be 'dydx_nodejs_connector' for package usage

async function main() {
    const connector = await DYDXConnector.build(NetworkID.RopstenTestNet)
    console.log(await connector.getAccount())
}
main()
