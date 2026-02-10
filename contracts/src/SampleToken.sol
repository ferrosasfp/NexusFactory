// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SampleToken
 * @dev ERC-20 token with owner-only minting and ERC-2612 permit.
 *      Built with OpenZeppelin for security and auditability.
 */
contract SampleToken is ERC20, ERC20Permit, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(initialOwner) {}

    /**
     * @dev Mint new tokens. Only callable by the contract owner.
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
