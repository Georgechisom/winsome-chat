// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    // Price feeds
    AggregatorV3Interface public btcUsdFeed;
    AggregatorV3Interface public ethUsdFeed;
    AggregatorV3Interface public bnbEthFeed;

    event PriceFeedUpdated(string pair, address feed);

    constructor() Ownable(msg.sender) {
        // Sepolia testnet addresses (change for mainnet)
        btcUsdFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
        ethUsdFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        bnbEthFeed = AggregatorV3Interface(0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22);

        // For mainnet, use:
        // btcUsdFeed = AggregatorV3Interface(0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c);
        // ethUsdFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
        // bnbEthFeed = AggregatorV3Interface(0xc546d2d06144F9DD42815b8bA46Ee7B8FcAFa4a2);
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

    function getBtcUsdPrice() external view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = btcUsdFeed.latestRoundData();
    }

    function getEthUsdPrice() external view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = ethUsdFeed.latestRoundData();
    }

    function getBnbEthPrice() external view returns (int256 price, uint256 timestamp) {
        (, price, , timestamp,) = bnbEthFeed.latestRoundData();
    }

    function getBtcEthPrice() external view returns (int256 price, uint256 timestamp) {
        (int256 btcPrice, uint256 btcTime) = this.getBtcUsdPrice();
        (int256 ethPrice, uint256 ethTime) = this.getEthUsdPrice();

        if (ethPrice <= 0) return (0, 0);

        // Both prices have 8 decimals, result should have 18 decimals for ETH precision
        price = (btcPrice * 1e18) / ethPrice;
        timestamp = btcTime < ethTime ? btcTime : ethTime; // Use older timestamp
    }

    function getAllPrices() external view returns (
        int256 btcUsd,
        int256 ethUsd,
        int256 btcEth,
        int256 bnbEth,
        uint256 timestamp
    ) {
        (btcUsd,) = this.getBtcUsdPrice();
        (ethUsd,) = this.getEthUsdPrice();
        (btcEth,) = this.getBtcEthPrice();
        (bnbEth,) = this.getBnbEthPrice();
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

    function getPriceMessage() external view returns (string memory) {
        (
            int256 btcUsd,
            int256 ethUsd,
            int256 btcEth,
            int256 bnbEth,
        ) = this.getAllPrices();

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
