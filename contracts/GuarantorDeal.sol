// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GuarantorDeal {
  event NewDeal(
    address indexed seller,
    address indexed buyer,
    address indexed guarantor,
    uint value,
    uint dealId
  );

  struct Deal {
    address seller;
    address buyer;
    address guarantor;
    uint amount;
    bool approved;
  }

  uint numDeals;
  mapping (uint => Deal) private deals;

  function create(address payable _seller, address _guarantor) public payable returns (uint) {
    require(msg.value > 0);
    uint dealId = numDeals++;
    Deal storage deal = deals[dealId];
    deal.seller = _seller;
    deal.buyer = msg.sender;
    deal.guarantor = _guarantor;
    deal.amount = msg.value;
    emit NewDeal(_seller, msg.sender, _guarantor, msg.value, dealId);
    return dealId;
  }

  // Approve deal by guarantor
  function approve(uint dealId) public {
    require(msg.sender == deals[dealId].guarantor);
    deals[dealId].approved = true;
  }

  // Refund deal by seller
  function refund(uint dealId) public {
    Deal storage deal = deals[dealId];
    require(msg.sender == deal.seller);
    uint amount = deal.amount;
    delete deals[dealId];
    payable(deal.buyer).transfer(amount);
  }

  function getDeal(uint dealId) external view returns (Deal memory) {
    Deal memory deal = deals[dealId];
    require(deal.amount > 0);
    return deal;
  }

  // Transfer funds to seller with withdraw pattern:
  // mark dealAmount as zero and then transfer it to the seller
  // to avoid multiple spending
  function withdraw(uint dealId) public {
    Deal storage deal = deals[dealId];
    require(msg.sender == deal.seller);
    require(deal.approved, "Withdraw was not approved by guarantor yet");
    uint amount = deal.amount;
    delete deals[dealId];
    payable(msg.sender).transfer(amount);
  }

  
}
