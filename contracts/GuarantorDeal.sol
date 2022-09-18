// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GuarantorDeal {
  struct Deal {
    address seller;
    address buyer;
    address guarantor;
    uint amount;
    bool approved;
  }

  uint numDeals;
  mapping (uint => Deal) private deals;

  function create(address payable _seller, address _guarantor) public payable returns (uint dealId) {
    require(msg.value > 0);
    dealId = numDeals++;
    Deal memory deal = deals[dealId];
    deal.seller = _seller;
    deal.buyer = msg.sender;
    deal.guarantor = _guarantor;
    deal.amount = msg.value;
  }

  function approve(uint dealId) public {
    Deal memory deal = deals[dealId];
    require(msg.sender == deal.guarantor);
    deal.approved = true;
  }

  // Transfer funds to seller with withdraw pattern:
  // mark dealAmount as zero and then transfer it to the seller
  // to avoid multiple spending
  function withdraw(uint dealId) public {
    Deal memory deal = deals[dealId];
    require(msg.sender == deal.seller);
    require(deal.approved, "Withdraw was not approved by guarantor yet");
    uint amount = deal.amount;
    delete deals[dealId];
    payable(msg.sender).transfer(amount);
  }

  
}
