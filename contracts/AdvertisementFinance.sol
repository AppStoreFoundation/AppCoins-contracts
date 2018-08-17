pragma solidity ^0.4.21;

import "./AppCoins.sol";
import "./Advertisement.sol";

/**
 * The AdvertisementFinance contract is responsible for keeping track of the 
 * AppCoins transfered by developers when creating campaings
 */
contract AdvertisementFinance {

    mapping (address => uint256) balanceDevelopers;
    mapping (address => bool) developerExists;
    
    address[] developers;
    address owner;
    address advertisementContract;
    address advStorageContract;
    AppCoins appc;

    modifier onlyOwner() { 
        require(owner == msg.sender); 
        _; 
    }

    modifier onlyAds() { 
        require(advertisementContract == msg.sender); 
        _; 
    }

    modifier onlyOwnerOrAds() { 
        require(msg.sender == owner || msg.sender == advertisementContract); 
        _; 
    }	

    function AdvertisementFinance (address _addrAppc) 
        public {
        owner = msg.sender;
        appc = AppCoins(_addrAppc);
        advStorageContract = 0x0;
    }

    function setAdsStorageAddress (address _addrStorage) external onlyOwnerOrAds {
        reset();
        advStorageContract = _addrStorage;
    }

    function setAdsContractAddress (address _addrAdvert) external onlyOwner {
        // Verify if the new Ads contract is using the same storage as before 
        if (advertisementContract != 0x0){
            Advertisement adsContract = Advertisement(advertisementContract);
            address adsStorage = adsContract.getAdvertisementStorageAddress();
            require (adsStorage == advStorageContract);
        }
        
        //Update contract
        advertisementContract = _addrAdvert;
    }
    

    function increaseBalance(address _developer, uint256 _value) 
        public onlyAds{

        if(developerExists[_developer] == false){
            developers.push(_developer);
            developerExists[_developer] = true;
        }

        balanceDevelopers[_developer] += _value;
    }

    function pay(address _developer, address _destination, uint256 _value) 
        public onlyAds{

        appc.transfer( _destination, _value);
        balanceDevelopers[_developer] -= _value;
    }

    function withdraw(address _developer, uint256 _value) public onlyOwnerOrAds {

        require(balanceDevelopers[_developer] >= _value);
        
        appc.transfer(_developer, _value);
        balanceDevelopers[_developer] -= _value;    
    }

    function reset() public onlyOwnerOrAds {
        for(uint i = 0; i < developers.length; i++){
            withdraw(developers[i],balanceDevelopers[developers[i]]);
        }
    }
    

}	

