import { DYDXConnector, NetworkID } from "./dydx-connector";

async function main() {
    let con = await DYDXConnector.build(NetworkID.RopstenTestNet)
    console.log(await con.getAccount())
}

main()