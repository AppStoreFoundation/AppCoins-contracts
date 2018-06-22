pragma solidity ^0.4.19;

import  { CampaignLibrary } from "./lib/CampaignLibrary.sol";


contract AdvertisementStorage {

    mapping (bytes32 => CampaignLibrary.Campaign) campaigns;
    mapping (address => bool) allowedAddresses;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyAllowedAddress() {
        require(allowedAddresses[msg.sender]);
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
            address  owner,
            string ipValidator,
            string packageName,
            uint[3] countries,
            uint[] vercodes
    );

    event CampaignUpdated
        (
            bytes32 bidId,
            uint price,
            uint budget,
            uint startDate,
            uint endDate,
            bool valid,
            address  owner,
            string ipValidator,
            string packageName,
            uint[3] countries,
            uint[] vercodes
    );

    function AdvertisementStorage() public {
        owner = msg.sender;
        allowedAddresses[msg.sender] = true;
    }

    function setAllowedAddresses(address newAddress, bool isAllowed) public onlyOwner {
        allowedAddresses[newAddress] = isAllowed;
    }


    function getCampaign(bytes32 campaignId)
        public
        view
        returns (
            bytes32,
            uint,
            uint,
            uint,
            uint,
            bool,
            address,
            string,
            string,
            uint[3],
            uint[]
        ) {

        CampaignLibrary.Campaign storage campaign = campaigns[campaignId];

        return (
            campaign.bidId,
            campaign.price,
            campaign.budget,
            campaign.startDate,
            campaign.endDate,
            campaign.valid,
            campaign.owner,
            campaign.ipValidator,
            campaign.filters.packageName,
            campaign.filters.countries,
            campaign.filters.vercodes
        );
    }


    function setCampaign (
        bytes32 bidId,
        uint price,
        uint budget,
        uint startDate,
        uint endDate,
        bool valid,
        address owner,
        string ipValidator
    )
    public
    onlyAllowedAddress {

        CampaignLibrary.Campaign memory campaign = campaigns[campaign.bidId];

        campaign = CampaignLibrary.Campaign({
            bidId: bidId,
            price: price,
            budget: budget,
            startDate: startDate,
            endDate: endDate,
            valid: valid,
            owner: owner,
            ipValidator: ipValidator,
            filters: campaign.filters
        });

        emitEvent(campaigns[campaign.bidId]);

        campaigns[campaign.bidId] = campaign;
    }

    function setCampaignFilters (
        bytes32 bidId,
        string packageName,
        uint[3] countries,
        uint[] vercodes
    )
    public
    onlyAllowedAddress {

        CampaignLibrary.Campaign memory campaign = campaigns[bidId];

        campaign.filters.packageName = packageName;
        campaign.filters.countries = countries;
        campaign.filters.vercodes = vercodes;

        emitEvent(campaigns[campaign.bidId]);

        campaigns[campaign.bidId] = campaign;
    }

    function getCampaignPriceById(bytes32 bidId)
        public
        view
        returns (uint) {
        return campaigns[bidId].price;
    }

    function setCampaignPriceById(bytes32 bidId, uint price)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].price = price;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignBudgetById(bytes32 bidId)
        public
        view
        returns (uint) {
        return campaigns[bidId].budget;
    }

    function setCampaignBudgetById(bytes32 bidId, uint newBudget)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].budget = newBudget;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignStartDateById(bytes32 bidId)
        public
        view
        returns (uint) {
        return campaigns[bidId].startDate;
    }

    function setCampaignStartDateById(bytes32 bidId, uint newStartDate)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].startDate = newStartDate;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignEndDateById(bytes32 bidId)
        public
        view
        returns (uint) {
        return campaigns[bidId].endDate;
    }

    function setCampaignEndDateById(bytes32 bidId, uint newEndDate)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].endDate = newEndDate;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignValidById(bytes32 bidId)
        public
        view
        returns (bool) {
        return campaigns[bidId].valid;
    }

    function setCampaignValidById(bytes32 bidId, bool isValid)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].valid = isValid;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignOwnerById(bytes32 bidId)
        public
        view
        returns (address) {
        return campaigns[bidId].owner;
    }

    function setCampaignOwnerById(bytes32 bidId, address newOwner)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].owner = newOwner;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignCountriesById(bytes32 bidId)
        public
        view
        returns (uint[3]) {
        return campaigns[bidId].filters.countries;
    }

    function setCampaignCountriesById(bytes32 bidId, uint[3] newCountries)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].filters.countries = newCountries;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignPackageNameById(bytes32 bidId)
        public
        view
        returns (string) {
        return campaigns[bidId].filters.packageName;
    }

    function setCampaignPackageNameById(bytes32 bidId, string newPackageName)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].filters.packageName = newPackageName;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignVercodesById(bytes32 bidId)
        public
        view
        returns (uint[]) {
        return campaigns[bidId].filters.vercodes;
    }

    function setCampaignVercodesById(bytes32 bidId, uint[] newVercodes)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].filters.vercodes = newVercodes;
        emitEvent(campaigns[bidId]);
    }

    function getCampaignIpValidatorById(bytes32 bidId)
        public
        view
        returns (string) {
        return campaigns[bidId].ipValidator;
    }

    function setCampaignIpValidatorById(bytes32 bidId, string newIpValidator)
        public
        onlyAllowedAddress
        {
        campaigns[bidId].ipValidator = newIpValidator;
        emitEvent(campaigns[bidId]);
    }

    function emitEvent(CampaignLibrary.Campaign campaign) private {

        if (campaigns[campaign.bidId].bidId == 0x0) {
            emit CampaignCreated(
                campaign.bidId,
                campaign.price,
                campaign.budget,
                campaign.startDate,
                campaign.endDate,
                campaign.valid,
                campaign.owner,
                campaign.ipValidator,
                campaign.filters.packageName,
                campaign.filters.countries,
                campaign.filters.vercodes
            );
        } else {
            emit CampaignUpdated(
                campaign.bidId,
                campaign.price,
                campaign.budget,
                campaign.startDate,
                campaign.endDate,
                campaign.valid,
                campaign.owner,
                campaign.ipValidator,
                campaign.filters.packageName,
                campaign.filters.countries,
                campaign.filters.vercodes
            );
        }
    }
}
