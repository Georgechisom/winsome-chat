// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPriceOracle {
    function getPriceMessage() external view returns (string memory);
}

struct GroupChatInfo {
    uint256 groupChatId;
    string name;
}

interface IChat {
    function sendPriceMessage(uint256 roomId, string calldata message) external;
    function getAllGroupChats() external view returns (GroupChatInfo[] memory);
}

contract PriceAutomation is AutomationCompatibleInterface, Ownable {
    IPriceOracle public priceOracle;
    IChat public chatContract;

    uint256 public updateInterval = 300; // 5 minutes
    uint256 public lastUpdateTime;

    error UpdateIntervalMustBePositive();
    error PriceOracleNotSet();
    error ChatContractNotSet();

    event PricesUpdated(uint256 timestamp, uint256 roomsUpdated);
    event ContractUpdated(string contractType, address newAddress);

    constructor(address _priceOracle, address _chatContract) Ownable(msg.sender) {
        priceOracle = IPriceOracle(_priceOracle);
        chatContract = IChat(_chatContract);
        lastUpdateTime = block.timestamp;
    }

    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = IPriceOracle(_priceOracle);
        emit ContractUpdated("PriceOracle", _priceOracle);
    }

    function setChatContract(address _chatContract) external onlyOwner {
        chatContract = IChat(_chatContract);
        emit ContractUpdated("ChatContract", _chatContract);
    }

    function setUpdateInterval(uint256 _interval) external onlyOwner {
        if (_interval == 0) revert UpdateIntervalMustBePositive();
        updateInterval = _interval;
    }

    // Chainlink Automation functions
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();
        if (address(chatContract) == address(0)) revert ChatContractNotSet();

        upkeepNeeded = (block.timestamp - lastUpdateTime) >= updateInterval;
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastUpdateTime) >= updateInterval) {
            lastUpdateTime = block.timestamp;
            updatePrices();
        }
    }

    function updatePrices() internal {
        string memory priceMessage = priceOracle.getPriceMessage();
        GroupChatInfo[] memory allChats = chatContract.getAllGroupChats();
        uint256 successCount = 0;

        // Send to all group chats
        for (uint256 i = 0; i < allChats.length; i++) {
            uint256 roomId = allChats[i].groupChatId;
            try chatContract.sendPriceMessage(roomId, priceMessage) {
                successCount++;
            } catch {
                // Continue if one room fails
            }
        }

        emit PricesUpdated(block.timestamp, successCount);
    }

    // Manual trigger for testing
    function manualUpdate() external onlyOwner {
        updatePrices();
        lastUpdateTime = block.timestamp;
    }

    function getTimeUntilNextUpdate() external view returns (uint256) {
        if (block.timestamp >= lastUpdateTime + updateInterval) {
            return 0;
        }
        return (lastUpdateTime + updateInterval) - block.timestamp;
    }
}
