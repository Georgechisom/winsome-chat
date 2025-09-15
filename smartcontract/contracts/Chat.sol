// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Chat is Ownable {

    constructor () Ownable(msg.sender) {}

    struct Message {
        address sender;
        uint256 timestamp;
        string contentCid;
    }

    struct GroupChat {
        string name;
        mapping(address => bool) members;
        Message[] messages;
    }

    mapping(uint256 => GroupChat) public groupChats;
    mapping(address => uint256[]) public userGroupChats;

    event RoomCreated(uint256 indexed roomId, string name);
    event MessageSent(uint256 indexed roomId, address indexed sender, string contentCid);
    event JoinedRoom(uint256 indexed roomId, address indexed user);

    uint256 public nextRoomId = 1;
    GroupChat[] public totalGroupChat;
}