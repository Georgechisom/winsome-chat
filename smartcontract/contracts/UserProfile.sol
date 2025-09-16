// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {

    struct ProfileData {
        string username;      
        string ipfsCid;      
        bool isRegistered;      
    }
    
    mapping(address => ProfileData) public profiles; 
    mapping(string => address) public winsomeNames;  
    mapping(address => string) public addressToWinsome; 
    address[] public userAddresses; 

    
    event ProfileSet(address indexed user, string username, string ipfsCid, string winsomeName);
    event ProfileUpdated(address indexed user, string username, string ipfsCid, string winsomeName);
    event WinsomeNameRegistered(address indexed user, string winsomeName, string username, string ipfsCid);

    error Name_cannot_be_empty();
    error Username_cannot_be_empty();
    error IPFS_CID_cannot_be_empty();
    error Username_Does_not_have_customNameDesign_winsome();
    error user_already_registered();
    error Address_already_has_a_name();

    constructor() Ownable(msg.sender) {}
   
    function registerWinsomeName(string calldata _name, string calldata _username, string calldata _ipfsCid) external {

        if (bytes(_name).length < 0) {
            revert Name_cannot_be_empty();
        }
        if (bytes(_username).length < 0) {
            revert Username_cannot_be_empty();
        }
        if (bytes(_ipfsCid).length < 0) {
            revert IPFS_CID_cannot_be_empty();
        }

        string memory fullName = string(abi.encodePacked(_name, ".winsome"));
        string memory newUserName = string(abi.encodePacked(_username, ".winsome"));
        
        // if (winsomeNames[fullName] == address(0)) {
        //     revert user_already_registered();
        // }
        
        if (bytes(addressToWinsome[msg.sender]).length > 0) {
            revert Address_already_has_a_name();
        }
        
        winsomeNames[fullName] = msg.sender;
        addressToWinsome[msg.sender] = fullName;

        if (winsomeNames[newUserName] == address(0)) {
            winsomeNames[newUserName] = msg.sender;
            addressToWinsome[msg.sender] = newUserName;
        }
        
        profiles[msg.sender] = ProfileData({
            username: newUserName,
            ipfsCid: _ipfsCid,
            isRegistered: true
        });
        userAddresses.push(msg.sender);

        emit WinsomeNameRegistered(msg.sender, fullName, _username, _ipfsCid);
    }

    
    function setProfile(string calldata _username, string calldata _ipfsCid, string calldata _winsomeName) external {
        if (bytes(_username).length < 0) {
            revert Username_cannot_be_empty();
        }
        if (bytes(_ipfsCid).length < 0) {
            revert IPFS_CID_cannot_be_empty();
        }
        if (bytes(_winsomeName).length < 0) {
            revert Name_cannot_be_empty();
        }
        if (_verifyWinsomeOwnership(msg.sender, _winsomeName)) {
            revert Username_Does_not_have_customNameDesign_winsome();
        }


        
        bool haveRegistered = profiles[msg.sender].isRegistered;
        profiles[msg.sender] = ProfileData({
            username: _username,
            ipfsCid: _ipfsCid,
            isRegistered: true
        });

        
        if (winsomeNames[_winsomeName] == address(0)) {
            winsomeNames[_winsomeName] = msg.sender;
            addressToWinsome[msg.sender] = _winsomeName;
            userAddresses.push(msg.sender);
            emit WinsomeNameRegistered(msg.sender, _winsomeName, _username, _ipfsCid);
        }

        // Emit event
        if (haveRegistered) {
            emit ProfileUpdated(msg.sender, _username, _ipfsCid, _winsomeName);
        } else {
            emit ProfileSet(msg.sender, _username, _ipfsCid, _winsomeName);
        }
    }

    
    function getProfileByAddress(address _user) external view returns (ProfileData memory) {
        return profiles[_user];
    }

    
    function getProfileByWinsomeName(string calldata _winsomeName) external view returns (ProfileData memory) {
        address user = winsomeNames[_winsomeName];
        require(user != address(0), "Winsome name not registered");
        return profiles[user];
    }

    
    function resolveWinsomeName(string calldata _winsomeName) external view returns (address) {
        address user = winsomeNames[_winsomeName];
        require(user != address(0), "Winsome name not registered");
        return user;
    }

    
    function getAllUsers() external view returns (ProfileData[] memory) {
        ProfileData[] memory userProfiles = new ProfileData[](userAddresses.length);
        for (uint256 i = 0; i < userAddresses.length; i++) {
            userProfiles[i] = profiles[userAddresses[i]];
        }
        return userProfiles;
    }

    
    function getTotalUsers() external view returns (uint256) {
        return userAddresses.length;
    }

    
    function _verifyWinsomeOwnership(address _owner, string memory _winsomeName) internal view returns (bool) {
        return winsomeNames[_winsomeName] == _owner;
    }
}