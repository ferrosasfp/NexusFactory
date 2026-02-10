// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SampleNFT.sol";

contract DeployNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        SampleNFT nft = new SampleNFT("NexusNFT", "NNFT", deployer);

        console.log("SampleNFT deployed at:", address(nft));
        console.log("Owner:", deployer);

        vm.stopBroadcast();
    }
}
