import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Profile.sol
  const Profile = await ethers.getContractFactory("UserProfile");
  const profile = await Profile.deploy();
  await profile.waitForDeployment();
  const userProfileAddress = await profile.getAddress();
  console.log("Profile deployed to:", userProfileAddress);

  // Deploy Chat.sol
  const Chat = await ethers.getContractFactory("WinsomeChat");
  const chat = await Chat.deploy();
  await chat.waitForDeployment();
  const winsomeChatAddress = await chat.getAddress();
  console.log("Chat deployed to:", winsomeChatAddress);

  return { userProfileAddress, winsomeChatAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
