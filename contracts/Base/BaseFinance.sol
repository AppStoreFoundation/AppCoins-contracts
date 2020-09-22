pragma solidity 0.4.24;

import "./Ownable.sol";
import "../AppCoins.sol";
import "./StorageUser.sol";
import "./SingleAllowance.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract BaseFinance is SingleAllowance {

    mapping (address => uint256) public balanceUsers;
    mapping (address => bool) public userExists;

    address[] public users;

    address public advStorageContract;

    AppCoins public appc;

    /**
    @notice Constructor function
    @dev 
        Initializes contract with the AppCoins contract address
    @param _addrAppc Address of the AppCoins (ERC-20) contract
    */
    constructor (address _addrAppc) 
        public {
        appc = AppCoins(_addrAppc);
        advStorageContract = 0x0;
    }


    /**
    @notice Sets the Storage contract address used by the allowed contract
    @dev
        The Storage contract address is mostly used as part of a failsafe mechanism to
        ensure contract upgrades are executed using the same Storage 
        contract. This function returns every value of AppCoins stored in this contract to their 
        owners. This function can only be called by the 
        Finance contract owner or by the allowed contract registered earlier in 
        this contract.
    @param _addrStorage Address of the new Storage contract
    */
    function setAdsStorageAddress (address _addrStorage) external onlyOwnerOrAllowed {
        reset();
        advStorageContract = _addrStorage;
    }

        /**
    @notice Sets the Advertisement contract address to allow calls from Advertisement contract
    @dev
        This function is used for upgrading the Advertisement contract without need to redeploy 
        Advertisement Finance and Advertisement Storage contracts. The function can only be called 
        by this contract's owner. During the update of the Advertisement contract address, the 
        contract for Advertisement Storage used by the new Advertisement contract is checked. 
        This function reverts if the new Advertisement contract does not use the same Advertisement 
        Storage contract earlier registered in this Advertisement Finance contract.
    @param _addr Address of the newly allowed contract 
    */
    function setAllowedAddress (address _addr) public onlyOwner("setAllowedAddress") {
        // Verify if the new Ads contract is using the same storage as before 
        if (allowedAddress != 0x0){
            StorageUser storageUser = StorageUser(_addr);
            address storageContract = storageUser.getStorageAddress();
            require (storageContract == advStorageContract);
        }
        
        //Update contract
        super.setAllowedAddress(_addr);
    }

    /**
    @notice Increases balance of a user
    @dev
        This function can only be called by the registered Advertisement contract and increases the 
        balance of a specific user on this contract. This function does not transfer funds, 
        this step need to be done earlier by the Advertisement contract. This function can only be 
        called by the registered Advertisement contract.
    @param _user Address of the user who will receive a balance increase
    @param _value Value of coins to increase the user's balance
    */
    function increaseBalance(address _user, uint256 _value) 
        public onlyAllowed{

        if(userExists[_user] == false){
            users.push(_user);
            userExists[_user] = true;
        }

        balanceUsers[_user] = SafeMath.add(balanceUsers[_user], _value);
    }

     /**
    @notice Transfers coins from a certain user to a destination address
    @dev
        Used to release a certain value of coins from a certain user to a destination address.
        This function updates the user's balance in the contract. It can only be called by the 
        Advertisement contract registered.
    @param _user Address of the user from which the value will be subtracted
    @param _destination Address receiving the value transfered
    @param _value Value to be transfered in AppCoins
    */
    function pay(address _user, address _destination, uint256 _value) public onlyAllowed;

    /**
    @notice Withdraws a certain value from a user's balance back to the user's account
    @dev
        Can be called from the Advertisement contract registered or by this contract's owner.
    @param _user Address of the user
    @param _value Value to be transfered in AppCoins
    */
    function withdraw(address _user, uint256 _value) public onlyOwnerOrAllowed;


    /**
    @notice Resets this contract and returns every amount deposited to each user registered
    @dev
        This function is used in case a contract reset is needed or the contract needs to be 
        deactivated. Thus returns every fund deposited to it's respective owner.
    */
    function reset() public onlyOwnerOrAllowed {
        for(uint i = 0; i < users.length; i++){
            withdraw(users[i],balanceUsers[users[i]]);
        }
    }
    /**
    @notice Transfers all funds of the contract to a single address
    @dev
        This function is used for finance contract upgrades in order to be more cost efficient.
    @param _destination Address receiving the funds
     */
    function transferAllFunds(address _destination) public onlyAllowed {
        uint256 balance = appc.balanceOf(address(this));
        appc.transfer(_destination,balance);
    }

      /**
    @notice Get balance of coins stored in the contract by a specific user
    @dev
        This function can only be called by the Advertisement contract
    @param _user Developer's address
    @return { '_balance' : 'Balance of coins deposited in the contract by the address' }
    */
    function getUserBalance(address _user) public view onlyAllowed returns(uint256 _balance){
        return balanceUsers[_user];
    }

    /**
    @notice Get list of users with coins stored in the contract 
    @dev
        This function can only be called by the Advertisement contract        
    @return { '_userList' : ' List of users registered in the contract'}
    */
    function getUserList() public view onlyAllowed returns(address[] _userList){
        return users;
    }
}