import assert = require("assert")
import { DydxClient } from '@dydxprotocol/v3-client'
import { DYDXConnector, NetworkID } from '../src/dydx-connector'

describe('Setup', () => {

    it('Check @dydxprotocol/v3-client is installed', () => {
        const client = new DydxClient('https://example.com');
        expect(client.ethPrivate).toBeTruthy();
        expect(client.eth).toBeTruthy();
        expect(client.onboarding).toBeTruthy();
        expect(client.private).toBeTruthy();
        expect(client.public).toBeTruthy();
    });

    it('Checking moralis endpoint', () => {
        assert.equal(DYDXConnector.isMoralisEntryPresent(), true)
    })

    it('Checking required keys', () => {
        assert.equal(DYDXConnector.checkGeneralKeysPresent(), true)
    })

    it('Checking eth private key', () => {
        assert.equal(DYDXConnector.isEthAddressPresent(), true)
    })

});

describe('Module', () => {

    it('Checking builder working', async () => {
        assert.notEqual(await DYDXConnector.build(NetworkID.RopstenTestNet), null)
    })
    
    it('Checking account present', async () => {
        const connector = await DYDXConnector.build(NetworkID.RopstenTestNet)
        const account = await connector.getAccount();
        assert.notEqual(account.id, null)
    })

})