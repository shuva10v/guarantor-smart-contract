const { balance } = require('@openzeppelin/test-helpers');

const GuarantorDeal = artifacts.require("GuarantorDeal");

contract('GuarantorDeal', (accounts) => {
  it('should create account', async () => {
    const instance = await GuarantorDeal.deployed();
    const receipt = await instance.create(accounts[1], accounts[2], {from: accounts[0], value: 100});
    const dealId = receipt.logs[0].args.dealId.toNumber();

    const deal = await instance.getDeal.call(dealId);

    assert.equal(deal.buyer, accounts[0]);
    assert.equal(deal.seller, accounts[1]);
    assert.equal(deal.guarantor, accounts[2]);
    assert.equal(deal.amount, 100);
  });

  it('should approve deal by guarantor', async() => {
    const instance = await GuarantorDeal.deployed();
    const receipt = await instance.create(accounts[1], accounts[2], {from: accounts[0], value: 200});
    const dealId = receipt.logs[0].args.dealId.toNumber();

    let deal = await instance.getDeal.call(dealId);

    assert.equal(deal.buyer, accounts[0]);
    assert.equal(deal.seller, accounts[1]);
    assert.equal(deal.guarantor, accounts[2]);
    assert.equal(deal.amount, 200);
    assert.equal(deal.approved, false);

    await instance.approve(dealId, {from: accounts[2]})

    deal = await instance.getDeal.call(dealId);
    assert.equal(deal.approved, true);
  })

  it('should not approve not by guarantor', async() => {
    const instance = await GuarantorDeal.deployed();
    const receipt = await instance.create(accounts[1], accounts[2], {from: accounts[0], value: 200});
    const dealId = receipt.logs[0].args.dealId.toNumber();

    let deal = await instance.getDeal.call(dealId);

    assert.equal(deal.buyer, accounts[0]);
    assert.equal(deal.seller, accounts[1]);
    assert.equal(deal.guarantor, accounts[2]);
    assert.equal(deal.amount, 200);
    assert.equal(deal.approved, false);

    let thrown = false;
    await instance.approve(dealId, {from: accounts[3]})
      .catch(() => thrown = true)
    assert.equal(thrown, true, "method has to be reverted")

    deal = await instance.getDeal.call(dealId);
    assert.equal(deal.approved, false);
  })

  it('should withdraw funds after approve', async() => {
    const instance = await GuarantorDeal.deployed();
    const dealAmount = web3.utils.toWei('0.3', 'ether');
    const receipt = await instance.create(accounts[1], accounts[2], {from: accounts[0], value: dealAmount});
    const dealId = receipt.logs[0].args.dealId.toNumber();

    let deal = await instance.getDeal.call(dealId);

    assert.equal(deal.buyer, accounts[0]);
    assert.equal(deal.seller, accounts[1]);
    assert.equal(deal.guarantor, accounts[2]);
    assert.equal(deal.amount, dealAmount);
    assert.equal(deal.approved, false);

    await instance.approve(dealId, {from: accounts[2]})

    deal = await instance.getDeal.call(dealId);
    assert.equal(deal.approved, true);
    
    const tracker = await balance.tracker(accounts[1]);
    await instance.withdraw(dealId, {from: accounts[1]});
    const { delta, fees } = await tracker.deltaWithFees();
    assert.equal(web3.utils.fromWei(delta.add(fees), 'ether'), '0.3');
  })

});