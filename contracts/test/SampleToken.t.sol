// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SampleToken.sol";

contract SampleTokenTest is Test {
    SampleToken public token;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1234);
        token = new SampleToken("NexusToken", "NXT", owner);
    }

    function test_Name() public view {
        assertEq(token.name(), "NexusToken");
    }

    function test_Symbol() public view {
        assertEq(token.symbol(), "NXT");
    }

    function test_OwnerCanMint() public {
        token.mint(user, 1000 ether);
        assertEq(token.balanceOf(user), 1000 ether);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, 1000 ether);
    }

    function test_Transfer() public {
        token.mint(owner, 100 ether);
        token.transfer(user, 50 ether);
        assertEq(token.balanceOf(user), 50 ether);
        assertEq(token.balanceOf(owner), 50 ether);
    }

    function test_Approve() public {
        token.mint(owner, 100 ether);
        token.approve(user, 50 ether);
        assertEq(token.allowance(owner, user), 50 ether);
    }

    function test_TransferFrom() public {
        token.mint(owner, 100 ether);
        token.approve(user, 50 ether);

        vm.prank(user);
        token.transferFrom(owner, user, 50 ether);

        assertEq(token.balanceOf(user), 50 ether);
    }

    function test_MintToZeroAddress() public {
        vm.expectRevert();
        token.mint(address(0), 100 ether);
    }
}
