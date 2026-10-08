// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
// Minimal WETH9 for tests: placed at the real WETH address with anvil_setCode (no constructor runs)
contract WETH {
    string public constant name = "Wrapped Ether"; string public constant symbol = "WETH"; uint8 public constant decimals = 18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    function deposit() public payable { balanceOf[msg.sender] += msg.value; emit Transfer(address(0), msg.sender, msg.value); }
    function withdraw(uint256 wad) external { require(balanceOf[msg.sender] >= wad, "balance too low"); balanceOf[msg.sender] -= wad; payable(msg.sender).transfer(wad); emit Transfer(msg.sender, address(0), wad); }
    function totalSupply() external view returns (uint256) { return address(this).balance; }
    function approve(address s, uint256 v) external returns (bool) { allowance[msg.sender][s] = v; return true; }
    function transfer(address to, uint256 v) external returns (bool) { require(balanceOf[msg.sender] >= v); balanceOf[msg.sender] -= v; balanceOf[to] += v; emit Transfer(msg.sender, to, v); return true; }
    function transferFrom(address from, address to, uint256 v) external returns (bool) { require(balanceOf[from] >= v); if (from != msg.sender && allowance[from][msg.sender] != type(uint256).max) { require(allowance[from][msg.sender] >= v); allowance[from][msg.sender] -= v; } balanceOf[from] -= v; balanceOf[to] += v; emit Transfer(from, to, v); return true; }
    receive() external payable { deposit(); }
}
