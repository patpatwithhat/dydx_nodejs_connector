import { DYDXConnector, NetworkID } from ".";

async function main ( ) {
    let connector = await DYDXConnector.build(NetworkID.RopstenTestNet)
    console.log(await connector.getAccount())
}
main()