pragma solidity ^0.4.19;


library CampaignLibrary {

    struct Campaign {
        bytes32 bidId;
        uint price;
        uint budget;
        uint startDate;
        uint endDate;
        bool valid;
        address  owner;
    }


    /**
    @notice Set campaign id 
    @param _bidId Id of the campaign
     */
    function setBidId(Campaign storage _campaign, bytes32 _bidId) internal {
        _campaign.bidId = _bidId;
    }

    /**
    @notice Get campaign id
    @return {'_bidId' : 'Id of the campaign'}
     */
    function getBidId(Campaign storage _campaign) internal view returns(bytes32 _bidId){
        return _campaign.bidId;
    }
   
    /**
    @notice Set campaing price per proof of attention
    @param _price Price of the campaign
     */
    function setPrice(Campaign storage _campaign, uint _price) internal {
        _campaign.price = _price;
    }

    /**
    @notice Get campaign price per proof of attention
    @return {'_price' : 'Price of the campaign'}
     */
    function getPrice(Campaign storage _campaign) internal view returns(uint _price){
        return _campaign.price;
    }

    /**
    @notice Set campaign total budget 
    @param _budget Total budget of the campaign
     */
    function setBudget(Campaign storage _campaign, uint _budget) internal {
        _campaign.budget = _budget;
    }

    /**
    @notice Get campaign total budget
    @return {'_budget' : 'Total budget of the campaign'}
     */
    function getBudget(Campaign storage _campaign) internal view returns(uint _budget){
        return _campaign.budget;
    }

    /**
    @notice Set campaign start date 
    @param _startDate Start date of the campaign (in milisecounds)
     */
    function setStartDate(Campaign storage _campaign, uint _startDate) internal{
        _campaign.startDate = _startDate;
    }

    /**
    @notice Get campaign start date 
    @return {'_startDate' : 'Start date of the campaign (in milisecounds)'}
     */
    function getStartDate(Campaign storage _campaign) internal view returns(uint _startDate){
        return _campaign.startDate;
    }
 
    /**
    @notice Set campaign end date 
    @param _endDate End date of the campaign (in milisecounds)
     */
    function setEndDate(Campaign storage _campaign, uint _endDate) internal {
        _campaign.endDate = _endDate;
    }

    /**
    @notice Get campaign end date 
    @return {'_endDate' : 'End date of the campaign (in milisecounds)'}
     */
    function getEndDate(Campaign storage _campaign) internal view returns(uint _endDate){
        return _campaign.endDate;
    }

    /**
    @notice Set campaign validity 
    @param _valid Validity of the campaign
     */
    function setValidity(Campaign storage _campaign, bool _valid) internal {
        _campaign.valid = _valid;
    }

    /**
    @notice Get campaign validity 
    @return {'_valid' : 'Boolean stating campaign validity'}
     */
    function getValidity(Campaign storage _campaign) internal view returns(bool _valid){
        return _campaign.valid;
    }

    /**
    @notice Set campaign owner 
    @param _owner Owner of the campaign
     */
    function setOwner(Campaign storage _campaign, address _owner) internal {
        _campaign.owner = _owner;
    }

    /**
    @notice Get campaign owner 
    @return {'_owner' : 'Address of the owner of the campaign'}
     */
    function getOwner(Campaign storage _campaign) internal view returns(address _owner){
        return _campaign.owner;
    }

    /**
    @notice Converts country index list into 3 uints
    @dev  
        Expects a list of country indexes such that the 2 digit country code is converted to an 
        index. Countries are expected to be indexed so a "AA" country code is mapped to index 0 and 
        "ZZ" country is mapped to index 675.
    @param countries List of country indexes
    @return {
        "countries1" : "First third of the byte array converted in a 256 bytes uint",
        "countries2" : "Second third of the byte array converted in a 256 bytes uint",
        "countries3" : "Third third of the byte array converted in a 256 bytes uint"
    }
    */
    function convertCountryIndexToBytes(uint[] countries) public pure
        returns (uint countries1,uint countries2,uint countries3){
        countries1 = 0;
        countries2 = 0;
        countries3 = 0;
        for(uint i = 0; i < countries.length; i++){
            uint index = countries[i];

            if(index<256){
                countries1 = countries1 | uint(1) << index;
            } else if (index<512) {
                countries2 = countries2 | uint(1) << (index - 256);
            } else {
                countries3 = countries3 | uint(1) << (index - 512);
            }
        }

        return (countries1,countries2,countries3);
    }    
}
