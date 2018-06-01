// AppCoins class B token contract

pragma solidity ^0.4.21;

contract ERC20Interface {
    function name() public view returns(bytes32);
    function symbol() public view returns(bytes32);
    function balanceOf (address _owner) public view returns(uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (uint);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
}

contract AppCoins {
    uint256 public totalSupply;
    mapping (address => mapping (address => uint256)) public allowance;
    
    function balanceOf (address _owner) public view returns (uint256);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (uint);
}

contract AppCoinsIAB {
    function division(uint numerator, uint denominator) public view returns (uint);
    function buy(uint _amount, string _sku, address _addr_appc, address _dev, address _appstore, address _oem) public view returns (bool);
}


contract AppCoinsBClass is ERC20Interface {

    address public owner;
    bytes32 private tokenName;
    bytes32 private tokenSymbol;
    uint8 public decimals = 18;
	// 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply;

	// This creates an array with all balances
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowance;

    AppCoins appc;

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);

    // This notifies clients about the amount created as class B tokens
    event Create(uint256 value, uint256 newTotalSupply);

    function AppCoinsBClass (address addrAppc)  public {
        owner = msg.sender;
        tokenName = "AppCoinsB";
        tokenSymbol = "APPCB";
        totalSupply = 0; // Initialy there are 0 class B tokens and the supply is updated as tokens are converted
        appc = AppCoins(addrAppc);
    }   

    function name () public view returns(bytes32) {
        return tokenName;
    }
    
    function symbol () public view returns(bytes32) {
        return tokenSymbol;
    }

    function balanceOf (address _owner) public view returns(uint256 balance) {
        return balances[_owner];
    }

    /** 
     *  Convert class A tokens to class B tokens and transfers 
     *  them to the defined address
     *  
     *  @param to The address of the receiver 
     *  @param _value the amount to convert 
    */
    function convertAndTransfer(address to,uint _value) external {
        //Transfer A class AppCoins to B class AppCoins contract
        require(appc.allowance(msg.sender, address(this)) >= _value);
        appc.transferFrom(msg.sender, address(this), _value);

        createToken(to,_value);
    }
    /**
     *  Convert class B tokens to class A tokens 
     *  can only be called from IAB contract
     *
     *  @param to The address of the receiver
     *  @param _value the amount to transfer
     */

    function revertAndTransfer(address to, uint _value) external returns (uint){
        //revert can only be done by IAB contract
        // FIXME require (msg.sender == address(AppCoinsIAB));
        // check that AppCoinsB contract has balance for the transaction
        require (appc.balanceOf(address(this)) >= _value);
        
        require (balances[to] >= _value);
        
        // destroy class B tokens
        burn(_value);
        
        // transfer class A tokens from AppCoinsBClass to receiver 
        appc.transfer(to,_value);

        emit Transfer(to,address(this),_value); 
    }
	
    /**
     *  Create token
     *
     *  Creates '_value' new tokens, updates total supply 
     *  and transfers tokens to 'to' address
     *
     *  @param to The address of the receiver
     *  @param _value the amount of class B token to be created
     */
    function createToken(address to, uint256 _value) internal {
        // Update B class AppCoins supply
        totalSupply += _value;
        // Update recipient balance
        balances[to] += _value;

        emit Create(_value,totalSupply);
        emit Transfer(address(this),to,_value); 
    }



    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint _value) internal returns (bool) {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        require(balances[_from] >= _value);
        // Check for overflows
        require(balances[_to] + _value > balances[_to]);
        // Save this for an assertion in the future
        uint previousBalances = balances[_from] + balances[_to];
        // Subtract from the sender
        balances[_from] -= _value;
        // Add the same to the recipient
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balances[_from] + balances[_to] == previousBalances);    
    }

    // /**
    //  * Transfer tokens
    //  *
    //  * Send `_amount` tokens to `_to` from your account
    //  *
    //  * @param _to The address of the recipient
    //  * @param _amount the amount to send
    //  */
    // function transfer(address _to, uint256 _amount) public {
    //     _transfer(msg.sender, _to, _amount);
    // }
    function transfer (address _to, uint256 _amount) public returns (bool success) {
        if (balances[msg.sender] >= _amount && _amount > 0 && balances[_to] + _amount > balances[_to]) {
            
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            emit Transfer(msg.sender, _to, _amount);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` on behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (uint) {
        require(_value <= allowance[_from][msg.sender]);     // Check allowance
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return allowance[_from][msg.sender];
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     */
    function approve(address _spender, uint256 _value) public
        returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        return true;
    }

	/**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     * Warning: burnt class B tokens do not decrease class A tokens
     * class A tokens remain in class B contract address
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);   // Check if the sender has enough
        balances[msg.sender] -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        emit Burn(msg.sender, _value);
        return true;
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     * Warning: burnt class B tokens do not decrease class A tokens
     * class A tokens remain in class B contract address
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(address _from, uint256 _value) public returns (bool success) {
        require(balances[_from] >= _value);                // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]);    // Check allowance
        balances[_from] -= _value;                         // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value;             // Subtract from the sender's allowance
        totalSupply -= _value;                              // Update totalSupply
        emit Burn(_from, _value);
        return true;
    }

}
