// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {

    struct userProfiles {
        string userEnsName;
        address userAddress;
        string userIpfsCid;
    }

    mapping (address => string) public userProfile;
    mapping (string => address) public ensDataToAddress;

    userProfiles[] public totalUserProfiles;

    error invalid_user();
    error user_ens_not_registered();

    event userProfileUpdated(address indexed user, string userIpfsCid);


    constructor () Ownable(msg.sender) {}

    function setUserProfile(string memory _userIpfsCid) external {

        if (msg.sender == address(0)) {revert invalid_user() ;}

        userProfile[msg.sender] = _userIpfsCid;

        emit userProfileUpdated(msg.sender, _userIpfsCid);
    }

    function setUserEnsProfile (string memory _userEnsName, string memory _userIpfsCid) external {

        if (msg.sender == address(0)) {
            revert invalid_user() ;
        }

        userProfiles memory newUser = userProfiles(_userEnsName, msg.sender, _userIpfsCid);

        ensDataToAddress[_userEnsName] = msg.sender;

        userProfile[msg.sender] = _userIpfsCid;

        totalUserProfiles.push(newUser);

        emit userProfileUpdated(msg.sender, _userIpfsCid);

    }

    function getUserProfile(address _user) external view returns (string memory) {

        return userProfile[_user];
    }

    function getUserEnsProfile(string memory _ensName) external view returns (string memory) {

        address user = ensDataToAddress[_ensName];

        if (bytes(userProfile[user]).length == 0) {
            revert user_ens_not_registered();
        }

        return userProfile[user];
    }

    function getAllUsers () external view returns (userProfiles[] memory ) {
        return totalUserProfiles;
    }


    function getNumberOfUsers () external view returns (uint256) {
        return totalUserProfiles.length;
    }
}