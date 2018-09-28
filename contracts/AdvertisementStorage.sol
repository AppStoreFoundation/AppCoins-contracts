pragma solidity ^0.4.19;

import "./Base/Whitelist.sol";

import  { CampaignLibrary } from "./lib/CampaignLibrary.sol";

/**
@title Advertisement Storage contract
@author App Store Foundation
@dev The Advertisement Storage contract works as part of the user aquisition flow of the 
Advertisement contract. This contract is responsible from storing information regardign user 
aquisiton campaigns.
*/
contract AdvertisementStorage is Whitelist {
    using CampaignLibrary for CampaignLibrary.Campaign;

    mapping (bytes32 => CampaignLibrary.Campaign) campaigns;

    modifier onlyIfCampaignExists(string _funcName, bytes32 _bidId) {
        if(campaigns[_bidId].owner == 0x0){
            emit Error(_funcName,"Campaign does not exist");
            return;
        }
        _;
    }

    event CampaignCreated
        (
            bytes32 bidId,
            uint price,
            uint budget,
            uint startDate,
            uint endDate,
            bool valid,
            address owner
    );

    event CampaignUpdated
        (
            bytes32 bidId,
            uint price,
            uint budget,
            uint startDate,
            uint endDate,
            bool valid,
            address  owner
    );

    /**
    @notice Constructor function
    @dev
        Initializes contract and updates allowed addresses to interact with contract functions.
    */
    function AdvertisementStorage() public {
        addAddressToWhitelist(msg.sender);
    }

    /**
    @notice Get a Campaign information
    @dev 
        Based on a camapaign Id (bidId), returns all stored information for that campaign.
    @param campaignId Id of the campaign
    @return {
        "bidId" : "Id of the campaign",
        "price" : "Value to pay for each proof-of-attention",
        "budget" : "Total value avaliable to be spent on the campaign",
        "startDate" : "Start date of the campaign (in miliseconds)",
        "endDate" : "End date of the campaign (in miliseconds)"
        "valid" : "Boolean informing if the campaign is valid",
        "campOwner" : "Address of the campaing's owner"
    }
    */
    function getCampaign(bytes32 campaignId)
        public
        view
        returns (
            bytes32 bidId,
            uint price,
            uint budget,
            uint startDate,
            uint endDate,
            bool valid,
            address campOwner
        ) {

        CampaignLibrary.Campaign storage campaign = campaigns[campaignId];

        return (
            campaign.getBidId(),
            campaign.getPrice(),
            campaign.getBudget(),
            campaign.getStartDate(),
            campaign.getEndDate(),
            campaign.getValidity(),
            campaign.getOwner()
        );
    }

    /**
    @notice Add or update a campaign information
    @dev
        Based on a campaign Id (bidId), a campaign can be created (if non existent) or updated.
        This function can only be called by the set of allowed addresses registered earlier.
        An event will be emited during this function's execution, a CampaignCreated event if the 
        campaign does not exist yet or a CampaignUpdated if the campaign id is already registered.

    @param bidId Id of the campaign
    @param price Value to pay for each proof-of-attention
    @param budget Total value avaliable to be spent on the campaign
    @param startDate Start date of the campaign (in miliseconds)
    @param endDate End date of the campaign (in miliseconds)
    @param valid Boolean informing if the campaign is valid
    @param owner Address of the campaing's owner
    */
    function setCampaign (
        bytes32 bidId,
        uint price,
        uint budget,
        uint startDate,
        uint endDate,
        bool valid,
        address owner
    )
    public
    onlyIfWhitelisted("setCampaign",msg.sender) {

        CampaignLibrary.Campaign storage campaign = campaigns[bidId];
        campaign.setBidId(bidId);
        campaign.setPrice(price);
        campaign.setBudget(budget);
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setValidity(valid);

        bool newCampaign = (campaigns[bidId].getOwner() == 0x0);

        campaign.setOwner(owner);

        if(newCampaign){
            emitCampaignCreated(campaign);
        } else {
            emitCampaignUpdated(campaign);
        }
    }

    /**
    @notice Get the price of a campaign
    @dev
        Based on the Campaign id, return the value paid for each proof of attention registered.
    @param bidId Campaign id to which the query refers
    @return { "price" : "Reward (in wei) for each proof of attention registered"} 
    */
    function getCampaignPriceById(bytes32 bidId)
        public
        view
        returns (uint price) {
        return campaigns[bidId].getPrice();
    }

    /** 
    @notice Set a new price for a campaign
    @dev
        Based on the Campaign id, updates the value paid for each proof of attention registered.
        This function can only be executed by allowed addresses and emits a CampaingUpdate event.
    @param bidId Campaing id to which the update refers
    @param price New price for each proof of attention
    */
    function setCampaignPriceById(bytes32 bidId, uint price)
        public
        onlyIfWhitelisted("setCampaignPriceById",msg.sender) 
        onlyIfCampaignExists("setCampaignPriceById",bidId)      
        {
        campaigns[bidId].setPrice(price);
        emitCampaignUpdated(campaigns[bidId]);
    }

    /**
    @notice Get the budget avaliable of a campaign
    @dev
        Based on the Campaign id, return the total value avaliable to pay for proofs of attention.
    @param bidId Campaign id to which the query refers
    @return { "budget" : "Total value (in wei) spendable in proof of attention rewards"} 
    */
    function getCampaignBudgetById(bytes32 bidId)
        public
        view
        returns (uint budget) {
        return campaigns[bidId].getBudget();
    }

    /**
    @notice Set a new campaign budget
    @dev
        Based on the Campaign id, updates the total value avaliable for proof of attention 
        registrations. This function can only be executed by allowed addresses and emits a 
        CampaignUpdated event. This function does not transfer any funds as this contract only works
        as a data repository, every logic needed will be processed in the Advertisement contract.
    @param bidId Campaign id to which the query refers
    @param newBudget New value for the total budget of the campaign
    */
    function setCampaignBudgetById(bytes32 bidId, uint newBudget)
        public
        onlyIfCampaignExists("setCampaignBudgetById",bidId)
        onlyIfWhitelisted("setCampaignBudgetById",msg.sender)
        {
        campaigns[bidId].setBudget(newBudget);
        emitCampaignUpdated(campaigns[bidId]);
    }

    /** 
    @notice Get the start date of a campaign
    @dev
        Based on the Campaign id, return the value (in miliseconds) corresponding to the start Date
        of the campaign.
    @param bidId Campaign id to which the query refers
    @return { "startDate" : "Start date (in miliseconds) of the campaign"} 
    */
    function getCampaignStartDateById(bytes32 bidId)
        public
        view
        returns (uint startDate) {
        return campaigns[bidId].getStartDate();
    }

    /**
    @notice Set a new start date for a campaign
    @dev
        Based of the Campaign id, updates the start date of a campaign. This function can only be 
        executed by allowed addresses and emits a CampaignUpdated event.
    @param bidId Campaign id to which the query refers
    @param newStartDate New value (in miliseconds) for the start date of the campaign
    */
    function setCampaignStartDateById(bytes32 bidId, uint newStartDate)
        public
        onlyIfCampaignExists("setCampaignStartDateById",bidId)
        onlyIfWhitelisted("setCampaignStartDateById",msg.sender)
        {
        campaigns[bidId].setStartDate(newStartDate);
        emitCampaignUpdated(campaigns[bidId]);
    }
    
    /** 
    @notice Get the end date of a campaign
    @dev
        Based on the Campaign id, return the value (in miliseconds) corresponding to the end Date
        of the campaign.
    @param bidId Campaign id to which the query refers
    @return { "endDate" : "End date (in miliseconds) of the campaign"} 
    */
    function getCampaignEndDateById(bytes32 bidId)
        public
        view
        returns (uint endDate) {
        return campaigns[bidId].getEndDate();
    }

    /**
    @notice Set a new end date for a campaign
    @dev
        Based of the Campaign id, updates the end date of a campaign. This function can only be 
        executed by allowed addresses and emits a CampaignUpdated event.
    @param bidId Campaign id to which the query refers
    @param newEndDate New value (in miliseconds) for the end date of the campaign
    */
    function setCampaignEndDateById(bytes32 bidId, uint newEndDate)
        public
        onlyIfCampaignExists("setCampaignEndDateById",bidId)
        onlyIfWhitelisted("setCampaignEndDateById",msg.sender)
        {
        campaigns[bidId].setEndDate(newEndDate);
        emitCampaignUpdated(campaigns[bidId]);
    }
    /** 
    @notice Get information regarding validity of a campaign.
    @dev
        Based on the Campaign id, return a boolean which represents a valid campaign if it has 
        the value of True else has the value of False.
    @param bidId Campaign id to which the query refers
    @return { "valid" : "Validity of the campaign"} 
    */
    function getCampaignValidById(bytes32 bidId)
        public
        view
        returns (bool valid) {
        return campaigns[bidId].getValidity();
    }

    /**
    @notice Set a new campaign validity state.
    @dev
        Updates the validity of a campaign based on a campaign Id. This function can only be 
        executed by allowed addresses and emits a CampaignUpdated event.
    @param bidId Campaign id to which the query refers
    @param isValid New value for the campaign validity
    */
    function setCampaignValidById(bytes32 bidId, bool isValid)
        public
        onlyIfCampaignExists("setCampaignValidById",bidId)
        onlyIfWhitelisted("setCampaignValidById",msg.sender)
        {
        campaigns[bidId].setValidity(isValid);
        emitCampaignUpdated(campaigns[bidId]);
    }

    /**
    @notice Get the owner of a campaign 
    @dev 
        Based on the Campaign id, return the address of the campaign owner.
    @param bidId Campaign id to which the query refers
    @return { "campOwner" : "Address of the campaign owner" } 
    */
    function getCampaignOwnerById(bytes32 bidId)
        public
        view
        returns (address campOwner) {
        return campaigns[bidId].getOwner();
    }

    /**
    @notice Set a new campaign owner 
    @dev
        Based on the Campaign id, update the owner of the refered campaign. This function can only 
        be executed by allowed addresses and emits a CampaignUpdated event.
    @param bidId Campaign id to which the query refers
    @param newOwner New address to be the owner of the campaign
    */
    function setCampaignOwnerById(bytes32 bidId, address newOwner)
        public
        onlyIfCampaignExists("setCampaignOwnerById",bidId)
        onlyIfWhitelisted("setCampaignOwnerById",msg.sender)
        {
        campaigns[bidId].setOwner(newOwner);
        emitCampaignUpdated(campaigns[bidId]);
    }

    /**
    @notice Function to emit campaign updates
    @dev
        It emits a CampaignUpdated event with the new campaign information. 
    */
    function emitCampaignUpdated(CampaignLibrary.Campaign storage campaign) private {
        emit CampaignUpdated(
            campaign.getBidId(),
            campaign.getPrice(),
            campaign.getBudget(),
            campaign.getStartDate(),
            campaign.getEndDate(),
            campaign.getValidity(),
            campaign.getOwner()
        );
    }

    /**
    @notice Function to emit campaign creations
    @dev
        It emits a CampaignCreated event with the new campaign created. 
    */
    function emitCampaignCreated(CampaignLibrary.Campaign storage campaign) private {
        emit CampaignCreated(
            campaign.getBidId(),
            campaign.getPrice(),
            campaign.getBudget(),
            campaign.getStartDate(),
            campaign.getEndDate(),
            campaign.getValidity(),
            campaign.getOwner()
        );
    }
}
