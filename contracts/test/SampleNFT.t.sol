// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SampleNFT.sol";

contract SampleNFTTest is Test {
    SampleNFT public nft;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1234);
        nft = new SampleNFT("NexusNFT", "NNFT", owner);
    }

    function test_Name() public view {
        assertEq(nft.name(), "NexusNFT");
    }

    function test_Symbol() public view {
        assertEq(nft.symbol(), "NNFT");
    }

    function test_SafeMint() public {
        uint256 tokenId = nft.safeMint(user, "ipfs://QmTest123");
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), user);
        assertEq(nft.tokenURI(0), "ipfs://QmTest123");
    }

    function test_MultipleMints() public {
        uint256 id0 = nft.safeMint(user, "ipfs://QmFirst");
        uint256 id1 = nft.safeMint(user, "ipfs://QmSecond");
        assertEq(id0, 0);
        assertEq(id1, 1);
        assertEq(nft.balanceOf(user), 2);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(user);
        vm.expectRevert();
        nft.safeMint(user, "ipfs://QmUnauthorized");
    }

    function test_TokenURI() public {
        nft.safeMint(user, "ipfs://QmMetadata");
        assertEq(nft.tokenURI(0), "ipfs://QmMetadata");
    }

    function test_SupportsInterface() public view {
        // ERC721
        assertTrue(nft.supportsInterface(0x80ac58cd));
        // ERC165
        assertTrue(nft.supportsInterface(0x01ffc9a7));
    }

    function test_MintToZeroAddress() public {
        vm.expectRevert();
        nft.safeMint(address(0), "ipfs://QmZero");
    }
}
