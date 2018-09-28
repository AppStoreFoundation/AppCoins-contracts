pragma solidity ^0.4.24;

import {CampaignLibrary} from "./CampaignLibrary.sol";

library CampaignExtendedLib {
    using CampaignLibrary for CampaignLibrary.Campaign;

    struct CampaignExtended  {
        CampaignLibrary.Campaign  baseCampaign;
        string signingEndpoint;
    }

    /**
    @notice Set campaign id 
    @param _bidId Id of the campaign
     */
    function setBidId(CampaignExtended storage _campaign, bytes32 _bidId) internal {
        _campaign.baseCampaign.setBidId(_bidId);
    }

    /**
    @notice Get campaign id
    @return {'_bidId' : 'Id of the campaign'}
     */
    function getBidId(CampaignExtended storage _campaign) internal view returns(bytes32 _bidId){
        return _campaign.baseCampaign.getBidId();
    }

    /**
    @notice Set campaing price per proof of attention
    @param _price Price of the campaign
     */
    function setPrice(CampaignExtended storage _campaign, uint _price) internal {
        _campaign.baseCampaign.setPrice(_price);
    }

    /**
    @notice Get campaign price per proof of attention
    @return {'_price' : 'Price of the campaign'}
     */
    function getPrice(CampaignExtended storage _campaign) internal view returns(uint _price){
        return _campaign.baseCampaign.getPrice();
    }

    /**
    @notice Set campaign total budget 
    @param _budget Total budget of the campaign
     */
    function setBudget(CampaignExtended storage _campaign, uint _budget) internal {
        _campaign.baseCampaign.setBudget(_budget);
    }

   /**
    @notice Get campaign total budget
    @return {'_budget' : 'Total budget of the campaign'}
     */
    function getBudget(CampaignExtended storage _campaign) internal view returns(uint _budget){
        return _campaign.baseCampaign.getBudget();
    }

    /**
    @notice Set campaign start date 
    @param _startDate Start date of the campaign (in milisecounds)
     */
    function setStartDate(CampaignExtended storage _campaign, uint _startDate) internal{
        _campaign.baseCampaign.setStartDate(_startDate);
    }

    /**
    @notice Get campaign start date 
    @return {'_startDate' : 'Start date of the campaign (in milisecounds)'}
     */
    function getStartDate(CampaignExtended storage _campaign) internal view returns(uint _startDate){
        return _campaign.baseCampaign.getStartDate();
    }

    /**
    @notice Set campaign end date 
    @param _endDate End date of the campaign (in milisecounds)
     */
    function setEndDate(CampaignExtended storage _campaign, uint _endDate) internal {
        _campaign.baseCampaign.setEndDate(_endDate);
    }

    /**
    @notice Get campaign end date 
    @return {'_endDate' : 'End date of the campaign (in milisecounds)'}
     */
    function getEndDate(CampaignExtended storage _campaign) internal view returns(uint _endDate){
        return _campaign.baseCampaign.getEndDate();
    }

    /**
    @notice Set campaign validity 
    @param _valid Validity of the campaign
     */
    function setValidity(CampaignExtended storage _campaign, bool _valid) internal {
        _campaign.baseCampaign.setValidity(_valid);
    }

    /**
    @notice Get campaign validity 
    @return {'_valid' : 'Boolean stating campaign validity'}
     */
    function getValidity(CampaignExtended storage _campaign) internal view returns(bool _valid){
        return _campaign.baseCampaign.getValidity();
    }

    /**
    @notice Set campaign owner 
    @param _owner Owner of the campaign
     */
    function setOwner(CampaignExtended storage _campaign, address _owner) internal {
        _campaign.baseCampaign.setOwner(_owner);
    }

    /**
    @notice Get campaign owner 
    @return {'_owner' : 'Address of the owner of the campaign'}
     */
    function getOwner(CampaignExtended storage _campaign) internal view returns(address _owner){
        return _campaign.baseCampaign.getOwner();
    }
    
    /**
    @notice Set proof of attention signing endpoint 
    @param _signingEndpoint URL for the signing service
     */
    function setEndpoint(CampaignExtended storage _campaign, string _signingEndpoint) internal {
        _campaign.signingEndpoint = _signingEndpoint;
    }
    
    /**
    @notice Get proof of attention signing endpoint  
    @return {'_endpoint' : 'URL for the signing service'}
     */
    function getEndpoint(CampaignExtended storage _campaign) internal view returns(string _endpoint){
        return _campaign.signingEndpoint;
    }

}