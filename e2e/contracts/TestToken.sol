// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
contract TestToken {
    string public name; string public symbol; uint8 public decimals;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    constructor(string memory n, string memory s, uint8 d, uint256 supply) { name = n; symbol = s; decimals = d; balanceOf[msg.sender] = supply; emit Transfer(address(0), msg.sender, supply); }
    function totalSupply() external pure returns (uint256) { return 0; }
    function approve(address spender, uint256 value) external returns (bool) { allowance[msg.sender][spender] = value; emit Approval(msg.sender, spender, value); return true; }
    function transfer(address to, uint256 value) external returns (bool) { require(balanceOf[msg.sender] >= value, "balance too low"); balanceOf[msg.sender] -= value; balanceOf[to] += value; emit Transfer(msg.sender, to, value); return true; }
    function transferFrom(address from, address to, uint256 value) external returns (bool) { require(allowance[from][msg.sender] >= value, "allowance too low"); require(balanceOf[from] >= value, "balance too low"); allowance[from][msg.sender] -= value; balanceOf[from] -= value; balanceOf[to] += value; emit Transfer(from, to, value); return true; }
}
