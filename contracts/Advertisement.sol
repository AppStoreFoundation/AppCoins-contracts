pragma solidity ^0.4.19;


import  { CampaignLibrary } from "./lib/CampaignLibrary.sol";
import "./AdvertisementStorage.sol";


contract AppCoins {
    mapping (address => mapping (address => uint256)) public allowance;
    function balanceOf (address _owner) public view returns (uint256);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (uint);
}


/**
 * The Advertisement contract collects campaigns registered by developers
 * and executes payments to users using campaign registered applications
 * after proof of Attention.
 */
contract Advertisement {

    struct ValidationRules {
        bool vercode;
        bool ipValidation;
        bool country;
        uint constipDailyConversions;
        uint walletDailyConversions;
    }

    ValidationRules public rules;
    bytes32[] bidIdList;
    mapping (bytes32 => CampaignLibrary.Campaign) campaigns;
    mapping (bytes => bytes32[]) campaignsByCountry;
    AppCoins appc;
    AdvertisementStorage advertisementStorage;
    bytes2[] countryList;
    address public owner;
    mapping (address => mapping (bytes32 => bool)) userAttributions;


    event PoARegistered(bytes32 bidId, string packageName,uint64[] timestampList,uint64[] nonceList,string walletName);
    event Error(string func, string message);

    /**
    * Constructor function
    *
    * Initializes contract with default validation rules
    */
    function Advertisement (address addrAppc, address addrAdverStorage) public {
        rules = ValidationRules(false, true, true, 2, 1);
        owner = msg.sender;
        appc = AppCoins(addrAppc);
        advertisementStorage = AdvertisementStorage(addrAdverStorage);
    }



    /**
    * Creates a campaign for a certain package name with
    * a defined price and budget
    */
    function createCampaign (
        string packageName,
        string countries,
        uint[] vercodes,
        uint price,
        uint budget,
        uint startDate,
        uint endDate)
        external {

        require(budget >= price);
        require(endDate >= startDate);


        CampaignLibrary.Campaign memory newCampaign;

        newCampaign.filters.packageName = packageName;
        newCampaign.filters.countries = countries;
        newCampaign.filters.vercodes = vercodes;
        newCampaign.price = price;
        newCampaign.startDate = startDate;
        newCampaign.endDate = endDate;

        //Transfers the budget to contract address
        if(appc.allowance(msg.sender, address(this)) < budget){
            emit Error("createCampaign","Not enough allowance");
            return;
        }

        appc.transferFrom(msg.sender, address(this), budget);

        newCampaign.budget = budget;
        newCampaign.owner = msg.sender;
        newCampaign.valid = true;
        newCampaign.bidId = uintToBytes(bidIdList.length);
        addCampaign(newCampaign);

    }

    function addCampaign(CampaignLibrary.Campaign campaign) internal {

		//Add to bidIdList
        bidIdList.push(campaign.bidId);

		//Add to campaign map
        advertisementStorage.setCampaign(
            campaign.bidId,
            campaign.price,
            campaign.budget,
            campaign.startDate,
            campaign.endDate,
            campaign.valid,
            campaign.owner,
            campaign.ipValidator
        );
        advertisementStorage.setCampaignFilters(
            campaign.bidId,
            campaign.filters.packageName,
            campaign.filters.countries,
            campaign.filters.vercodes
        );

		//Assuming each country is represented in ISO country codes
        bytes memory country = new bytes(2);
        bytes memory countriesInBytes = bytes(campaign.filters.countries);
        uint countryLength = 0;

        for (uint i = 0; i < countriesInBytes.length; i++){

			//if ',' is found, new country ahead
            if(countriesInBytes[i] == "," || i == countriesInBytes.length-1){

                if(i == countriesInBytes.length - 1){
                    country[countryLength] = countriesInBytes[i];
				}

                addCampaignToCountryMap(campaign,country);

                country = new bytes(2);
                countryLength = 0;
			} else {
                country[countryLength] = countriesInBytes[i];
                countryLength++;
			}
        }

    }


    function addCampaignToCountryMap (CampaignLibrary.Campaign newCampaign, bytes country) internal {
		// Adds a country to countryList if the country is not in this list
        if (campaignsByCountry[country].length == 0){
            bytes2 countryCode;
            assembly {
			       countryCode := mload(add(country, 32))
            }

            countryList.push(countryCode);
		}

		//Adds Campaign to campaignsByCountry map
        campaignsByCountry[country].push(newCampaign.bidId);

    }

    function registerPoA (
        string packageName, bytes32 bidId,
        uint64[] timestampList, uint64[] nonces,
        address appstore, address oem,
        string walletName) external {

        if(!isCampaignValid(bidId)){
            emit Error(
                "registerPoA","Registering a Proof of attention to a invalid campaign");
            return;
        }

        if(timestampList.length != nonces.length){
            emit Error(
                "registerPoA","Nounce list and timestamp list must have same length");
            return;
        }
        //Expect ordered array arranged in ascending order
        for (uint i = 0; i < timestampList.length - 1; i++) {
            uint timestampDiff = (timestampList[i+1]-timestampList[i]);
            if((timestampDiff / 1000) != 10){
                emit Error(
                    "registerPoA","Timestamps should be spaced exactly 10 secounds");
                return;
            }
        }

        if(!areNoncesValid(bytes(packageName), timestampList, nonces)){
            emit Error(
                "registerPoA","Incorrect nounces for submited proof of attention");
            return;
        }

        if(userAttributions[msg.sender][bidId]){
            emit Error(
                "registerPoA","User already registered a proof of attention for this campaign");
            return;
        }
        //atribute
        userAttributions[msg.sender][bidId] = true;

        payFromCampaign(bidId, appstore, oem);

        emit PoARegistered(bidId, packageName, timestampList, nonces, walletName);
    }

    function cancelCampaign (bytes32 bidId) external {
        address campaignOwner = getOwnerOfCampaign(bidId);

		// Only contract owner or campaign owner can cancel a campaign
        require (owner == msg.sender || campaignOwner == msg.sender);
        uint budget = getBudgetOfCampaign(bidId);

        appc.transfer(campaignOwner, budget);

        advertisementStorage.setCampaignBudgetById(bidId, 0);
        advertisementStorage.setCampaignValidById(bidId, false);
    }

    function getCampaignValidity(bytes32 bidId) public view returns(bool){
        return advertisementStorage.getCampaignValidById(bidId);
    }

    function getCountryList() public view returns(bytes2[]) {
        return countryList;
    }

    function getCampaignsByCountry(string country) public view returns (bytes32[]){
        bytes memory countryInBytes = bytes(country);

        return campaignsByCountry[countryInBytes];
    }


    function getTotalCampaignsByCountry (string country) public view returns (uint){
        bytes memory countryInBytes = bytes(country);

        return campaignsByCountry[countryInBytes].length;
    }

    function getPackageNameOfCampaign (bytes32 bidId) public view returns(string) {
        return advertisementStorage.getCampaignPackageNameById(bidId);
    }

    function getCountriesOfCampaign (bytes32 bidId) public view returns(string){
        return advertisementStorage.getCampaignCountriesById(bidId);
    }

    function getVercodesOfCampaign (bytes32 bidId) public view returns(uint[]) {
        return advertisementStorage.getCampaignVercodesById(bidId);
    }

    function getPriceOfCampaign (bytes32 bidId) public view returns(uint) {
        return advertisementStorage.getCampaignPriceById(bidId);
    }

    function getStartDateOfCampaign (bytes32 bidId) public view returns(uint) {
        return advertisementStorage.getCampaignStartDateById(bidId);
    }

    function getEndDateOfCampaign (bytes32 bidId) public view returns(uint) {
        return advertisementStorage.getCampaignEndDateById(bidId);
    }

    function getBudgetOfCampaign (bytes32 bidId) public view returns(uint) {
        return advertisementStorage.getCampaignBudgetById(bidId);
    }

    function getOwnerOfCampaign (bytes32 bidId) public view returns(address) {
        return advertisementStorage.getCampaignOwnerById(bidId);
    }

    function getBidIdList() public view returns(bytes32[]) {
        return bidIdList;
    }

    function isCampaignValid(bytes32 bidId) public view returns(bool) {
        uint startDate = advertisementStorage.getCampaignStartDateById(bidId);
        uint endDate = advertisementStorage.getCampaignEndDateById(bidId);
        bool valid = advertisementStorage.getCampaignValidById(bidId);

        uint nowInMilliseconds = now * 1000;
        return valid && startDate < nowInMilliseconds && endDate > nowInMilliseconds;
    }

    function payFromCampaign (bytes32 bidId, address appstore, address oem) internal {
        uint devShare = 85;
        uint appstoreShare = 10;
        uint oemShare = 5;

        //Search bid price
        uint price = advertisementStorage.getCampaignPriceById(bidId);
        uint budget = advertisementStorage.getCampaignBudgetById(bidId);

        require(budget > 0);
        require(budget >= price);

        //transfer to user, appstore and oem
        appc.transfer(msg.sender, division(price * devShare, 100));
        appc.transfer(appstore, division(price * appstoreShare, 100));
        appc.transfer(oem, division(price * oemShare, 100));

        //subtract from campaign
        uint newBudget = budget - price;

        advertisementStorage.setCampaignBudgetById(bidId, newBudget);


        if (newBudget < price) {
            advertisementStorage.setCampaignValidById(bidId, false);
        }
    }

    function areNoncesValid (bytes packageName,uint64[] timestampList, uint64[] nonces) internal returns(bool) {

        for(uint i = 0; i < nonces.length; i++){
            bytes8 timestamp = bytes8(timestampList[i]);
            bytes8 nonce = bytes8(nonces[i]);
            bytes memory byteList = new bytes(packageName.length + timestamp.length);

            for(uint j = 0; j < packageName.length;j++){
                byteList[j] = packageName[j];
            }

            for(j = 0; j < timestamp.length; j++ ){
                byteList[j + packageName.length] = timestamp[j];
            }

            bytes32 result = sha256(byteList);

            bytes memory noncePlusHash = new bytes(result.length + nonce.length);

            for(j = 0; j < nonce.length; j++){
                noncePlusHash[j] = nonce[j];
            }

            for(j = 0; j < result.length; j++){
                noncePlusHash[j + nonce.length] = result[j];
            }

            result = sha256(noncePlusHash);

            bytes2[1] memory leadingBytes = [bytes2(0)];
            bytes2 comp = 0x0000;

            assembly{
            	mstore(leadingBytes,result)
            }

            if(comp != leadingBytes[0]){
                return false;
            }

        }
        return true;
    }


    function division(uint numerator, uint denominator) public view returns (uint) {
        uint _quotient = numerator / denominator;
        return _quotient;
    }

    function uintToBytes (uint256 i) public view returns(bytes32 b) {
        b = bytes32(i);
    }

}
