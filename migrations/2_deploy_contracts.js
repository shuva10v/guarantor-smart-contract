const GuarantorDeal = artifacts.require("./GuarantorDeal.sol");

module.exports = function(deployer) {
  deployer.deploy(GuarantorDeal).then(() => console.log(GuarantorDeal.address));
};