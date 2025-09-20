// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";

interface IChat {
    function sendPriceMessage(uint256 roomId, string calldata message) external;
}

contract PriceAutomation is AutomationCompatibleInterface, Ownable {
    using ABDKMath64x64 for int128;

    // Price feeds
    AggregatorV3Interface public btcUsdFeed;
    AggregatorV3Interface public ethUsdFeed;
    AggregatorV3Interface public bnbEthFeed;

    IChat public chatContract;

    uint256 public updateInterval = 300; // 5 minutes
    uint256 public lastUpdateTime;

    mapping(uint256 => bool) public enabledGroups;
    uint256[] public enabledGroupIds;

    error UpdateIntervalMustBePositive();
    error ChatContractNotSet();

    event PricesUpdated(uint256 timestamp, uint256 roomsUpdated);
    event ContractUpdated(string contractType, address newAddress);
    event PriceFeedUpdated(string pair, address feed);
    event GroupAdded(uint256 groupId);
    event GroupRemoved(uint256 groupId);

    constructor(address _chatContract) Ownable(msg.sender) {
        chatContract = IChat(_chatContract);
        lastUpdateTime = block.timestamp;

        // Sepolia testnet addresses
        btcUsdFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
        ethUsdFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        bnbEthFeed = AggregatorV3Interface(0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22);
    }

    function setChatContract(address _chatContract) external onlyOwner {
        chatContract = IChat(_chatContract);
        emit ContractUpdated("ChatContract", _chatContract);
    }

    function setUpdateInterval(uint256 _interval) external onlyOwner {
        if (_interval == 0) revert UpdateIntervalMustBePositive();
        updateInterval = _interval;
    }

    function setBtcUsdFeed(address _feed) external onlyOwner {
        btcUsdFeed = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated("BTC/USD", _feed);
    }

    function setEthUsdFeed(address _feed) external onlyOwner {
        ethUsdFeed = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated("ETH/USD", _feed);
    }

    function setBnbEthFeed(address _feed) external onlyOwner {
        bnbEthFeed = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated("BNB/ETH", _feed);
    }

    function addGroupForFeeds(uint256 groupId) external onlyOwner {
        if (!enabledGroups[groupId]) {
            enabledGroups[groupId] = true;
            enabledGroupIds.push(groupId);
            emit GroupAdded(groupId);
        }
    }

    function removeGroupForFeeds(uint256 groupId) external onlyOwner {
        if (enabledGroups[groupId]) {
            enabledGroups[groupId] = false;
            for (uint256 i = 0; i < enabledGroupIds.length; i++) {
                if (enabledGroupIds[i] == groupId) {
                    enabledGroupIds[i] = enabledGroupIds[enabledGroupIds.length - 1];
                    enabledGroupIds.pop();
                    break;
                }
            }
            emit GroupRemoved(groupId);
        }
    }

    function getEnabledGroups() external view returns (uint256[] memory) {
        return enabledGroupIds;
    }

    // Chainlink Automation functions
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
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
        string memory priceMessage = getPriceMessage();
        uint256 successCount = 0;

        for (uint256 i = 0; i < enabledGroupIds.length; i++) {
            uint256 roomId = enabledGroupIds[i];
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

    function getBtcUsdPrice() public view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = btcUsdFeed.latestRoundData();
    }

    function getEthUsdPrice() public view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = ethUsdFeed.latestRoundData();
    }

    function getBnbEthPrice() public view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = bnbEthFeed.latestRoundData();
    }

    function getBtcEthPrice() public view returns (int256 price, uint256 timestamp) {
        (int256 btcPrice, uint256 btcTime) = getBtcUsdPrice();
        (int256 ethPrice, uint256 ethTime) = getEthUsdPrice();

        if (ethPrice <= 0) return (0, 0);

        int128 btcPriceFixed = ABDKMath64x64.fromInt(btcPrice);
        int128 ethPriceFixed = ABDKMath64x64.fromInt(ethPrice);
        int128 resultFixed = ABDKMath64x64.div(btcPriceFixed, ethPriceFixed);
        int128 decimalsMultiplier = ABDKMath64x64.fromInt(1e10);
        int128 adjustedResult = ABDKMath64x64.mul(resultFixed, decimalsMultiplier);
        price = ABDKMath64x64.toInt(adjustedResult);
        timestamp = btcTime < ethTime ? btcTime : ethTime;
    }

    function getAllPrices() public view returns (
        int256 btcUsd,
        int256 ethUsd,
        int256 btcEth,
        int256 bnbEth,
        uint256 timestamp
    ) {
        (btcUsd,) = getBtcUsdPrice();
        (ethUsd,) = getEthUsdPrice();
        (btcEth,) = getBtcEthPrice();
        (bnbEth,) = getBnbEthPrice();
        timestamp = block.timestamp;
    }

    function formatPrice(int256 price, uint8 decimals) public pure returns (string memory) {
        if (price <= 0) return "0.00";
        uint256 adjustedPrice = uint256(price);
        uint256 divisor = 10 ** decimals;
        uint256 integerPart = adjustedPrice / divisor;
        uint256 fractionalPart = (adjustedPrice % divisor) / (divisor / 100);
        return string(abi.encodePacked(
            toString(integerPart),
            ".",
            fractionalPart < 10 ? "0" : "",
            toString(fractionalPart)
        ));
    }

    function getPriceMessage() public view returns (string memory) {
        (
            int256 btcUsd,
            int256 ethUsd,
            int256 btcEth,
            int256 bnbEth,
        ) = getAllPrices();

        return string(abi.encodePacked(
            " **LIVE CRYPTO PRICES** \\n\\n",
            " **BTC/USD**: $", formatPrice(btcUsd, 8), "\\n",
            " **ETH/USD**: $", formatPrice(ethUsd, 8), "\\n",
            " **BTC/ETH**: ", formatPrice(btcEth, 18), " ETH\\n",
            " **BNB/ETH**: ", formatPrice(bnbEth, 18), " ETH\\n\\n",
            " Updated: ", toString(block.timestamp)
        ));
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
