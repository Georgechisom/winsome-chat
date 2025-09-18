// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract WinsomeChat is Ownable {
    
    struct Message {
        address sender;
        uint256 timestamp;
        string contentCid;
    }

    
    struct GroupChat {
        string name;
        mapping(address => bool) members;
        Message[] messages;
        uint256 memberCount;
    }

    
    struct GroupChatInfo {
        uint256 groupChatId;
        string name;
    }


    mapping(uint256 => GroupChat) public groupChats;
    mapping(address => uint256[]) public userGroupChats;
    mapping(address => bool) private registeredUsers;
    uint256 public totalUsers;
    uint256 public totalGroupChats;
    uint256 public nextGroupChatId = 1;

    
    event GroupChatCreated(uint256 indexed groupChatId, string name);
    event MessageSent(uint256 indexed groupChatId, address indexed sender, string contentCid);
    event JoinedGroupChat(uint256 indexed groupChatId, address indexed user);
    event PrivateMessageSent(address sender, address receiver, string message);

    constructor() Ownable(msg.sender) {}

   
    function createGroupChat(string memory _name) external returns (uint256) {
        uint256 groupChatId = nextGroupChatId++;
        GroupChat storage groupChat = groupChats[groupChatId];
        groupChat.name = _name;
        if (!registeredUsers[msg.sender]) {
            registeredUsers[msg.sender] = true;
            totalUsers++;
        }
        groupChat.members[msg.sender] = true;
        groupChat.memberCount = 1;  // Creator
        userGroupChats[msg.sender].push(groupChatId);
        totalGroupChats++;
        emit GroupChatCreated(groupChatId, _name);
        return groupChatId;
    }

   
    function joinGroupChat(uint256 _groupChatId) external {
        GroupChat storage groupChat = groupChats[_groupChatId];
        require(groupChat.messages.length > 0 || bytes(groupChat.name).length > 0, "Group chat does not exist");
        if (!registeredUsers[msg.sender]) {
            registeredUsers[msg.sender] = true;
            totalUsers++;
        }
        if (!groupChat.members[msg.sender]) {
            groupChat.members[msg.sender] = true;
            groupChat.memberCount++;
            userGroupChats[msg.sender].push(_groupChatId);
            emit JoinedGroupChat(_groupChatId, msg.sender);
        }
    }

   
    function sendGroupMessage(uint256 _groupChatId, string memory _contentCid) external {
        GroupChat storage groupChat = groupChats[_groupChatId];
        require(groupChat.members[msg.sender], "Not a member");
        groupChat.messages.push(Message(msg.sender, block.timestamp, _contentCid));
        emit MessageSent(_groupChatId, msg.sender, _contentCid);
    }

    function sendPrivateMessage(address _otherUser, string memory _contentCid) external {
        
        address[2] memory users = [msg.sender, _otherUser];
        totalUsers++;
        if (msg.sender > _otherUser) {
            users = [_otherUser, msg.sender];
        }
        bytes32 privateMessageIdBytes = keccak256(abi.encodePacked(users[0], users[1]));
        uint256 privateMessageId = uint256(privateMessageIdBytes);
        GroupChat storage groupChat = groupChats[privateMessageId];

        groupChat.messages.push(Message(msg.sender, block.timestamp, _contentCid));
        emit PrivateMessageSent(msg.sender, _otherUser, _contentCid);
    }

    
    function getMessages(uint256 _groupChatId, uint256 _start, uint256 _count) external view returns (Message[] memory) {
        GroupChat storage groupChat = groupChats[_groupChatId];
        uint256 len = groupChat.messages.length;
        if (_start + _count > len) _count = len - _start;
        Message[] memory msgs = new Message[](_count);
        for (uint256 i = 0; i < _count; i++) {
            msgs[i] = groupChat.messages[_start + i];
        }
        return msgs;

    }

    
    function getUserGroupChats(address _user) external view returns (GroupChatInfo[] memory) {
        uint256[] storage groupChatIds = userGroupChats[_user];
        GroupChatInfo[] memory groupChatInfos = new GroupChatInfo[](groupChatIds.length);
        for (uint256 i = 0; i < groupChatIds.length; i++) {
            groupChatInfos[i] = GroupChatInfo({
                groupChatId: groupChatIds[i],
                name: groupChats[groupChatIds[i]].name
            });
        }
        return groupChatInfos;
    }

    
    function getTotalGroupChatsPerUser(address _user) external view returns (uint256) {
        return userGroupChats[_user].length;
    }

   
    function getTotalUserCount() external view returns (uint256) {
        return totalUsers;
    }


    function getGroupChatUserCount(uint256 _groupChatId) external view returns (uint256) {
        return groupChats[_groupChatId].memberCount;
    }

    
    function getTotalGroupChatsInSystem() external view returns (uint256) {
        return totalGroupChats;
    }
}