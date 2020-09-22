pragma solidity 0.4.24;

import "./AppCoins.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
@title AppCoinsTimelock
@author App Store Foundation
@dev AppCoinsTimelock is a token holder contract that will allow a
* beneficiary to extract the tokens after a given time
*/
contract AppCoinsTimelock {

    // AppCoins token
    AppCoins private appc;

    // beneficiary of tokens
    mapping (address => uint) public balances;

    // timestamp when token release is enabled
    uint private releaseTime;

    event NewFundsAllocated(address _address,  uint _amount);
    event FundsReleased(address _address,  uint _amount);

    /**
    @notice Constructor function
    @dev
        Initializes contract with default validation rules
    @param _addrAppc Address of the AppCoins (ERC-20) contract
    @param _releaseTime uint of time when the tokens are avaialble
    */
    constructor(
        address _addrAppc,
        uint256 _releaseTime
    )
    public
    {
        appc = AppCoins(_addrAppc);
        releaseTime = _releaseTime;
    }

    /**
    *@notice Get the release time
    *@dev
    *    returns the release time
    *@return {"releaseTime" : "release time"}
    */
    function getReleaseTime() public view returns(uint256) {
        return releaseTime;
    }

    /**
    *@notice Get the balance of target address
    *@dev
    *    returns the release time
    *@param _address
    *@return {"amount" : "balance of the address"}
    */
    function getBalanceOf(address _address) public view returns(uint256){
        return balances[_address];
    }

    /**
    @notice Allocate funds to a address
    @dev
        inserts or adds funds to a address
    @param _address target address
    @param _amount uint of the amount to be stored
    */
    function allocateFunds(address _address, uint256 _amount) public {
        
        balances[_address] = SafeMath.add(balances[_address], _amount);

        require(appc.allowance(msg.sender, address(this)) >= _amount);
        
        appc.transferFrom(msg.sender, address(this), _amount);

        emit NewFundsAllocated(_address, balances[_address]);
    }

    /**
    @notice Allocate funds to multiple addresses
    @dev
        inserts or adds funds to one or more addresses
    @param _addresses array fo addresses
    @param _amounts array the amounts to be stored
    */
    function allocateFundsBulk(address[] _addresses, uint256[] _amounts) public {
        require(_addresses.length == _amounts.length);
        for(uint i = 0; i < _addresses.length; i++){
            allocateFunds(_addresses[i], _amounts[i]);
        }
    }

    /**
    @notice Release funds to for one address
    @dev
        return an amount of AppCoins to a address
    @param _address address to be funded
    */
    function release(address _address) public {
        require(balances[_address] > 0);
        uint nowInMilliseconds = block.timestamp * 1000;
        require(nowInMilliseconds >= releaseTime);
        uint amount = balances[_address];
        balances[_address] = 0;
        appc.transfer(_address, amount);
        emit FundsReleased(_address, amount);
    }
}
