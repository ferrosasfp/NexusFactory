// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SampleToken.sol";

contract DeployToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        SampleToken token = new SampleToken("NexusToken", "NXT", deployer);

        console.log("SampleToken deployed at:", address(token));
        console.log("Owner:", deployer);

        vm.stopBroadcast();
    }
}
