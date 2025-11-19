const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Lockdrop", function () {
  let lockdrop;
  let owner;
  let recipient;
  let otherAccount;

  const VALID_KEY_CID = "QmTest123KeyCID";
  const VALID_MESSAGE_CID = "QmTest456MessageCID";
  const VALID_HASH = "a".repeat(64);

  beforeEach(async function () {
    [owner, recipient, otherAccount] = await ethers.getSigners();
    
    const Lockdrop = await ethers.getContractFactory("Lockdrop");
    lockdrop = await Lockdrop.deploy();
    await lockdrop.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero message count", async function () {
      expect(await lockdrop.getMessageCount()).to.equal(0);
    });
  });

  describe("Store Message", function () {
    it("Should store a message successfully", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      const tx = await lockdrop.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        recipient.address
      );

      await expect(tx)
        .to.emit(lockdrop, "MessageStored")
        .withArgs(0, owner.address, recipient.address, futureTimestamp);

      expect(await lockdrop.getMessageCount()).to.equal(1);
    });

    it("Should revert if key CID is empty", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        lockdrop.storeMessage("", VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, recipient.address)
      ).to.be.revertedWithCustomError(lockdrop, "InvalidKeyCID");
    });

    it("Should revert if message CID is empty", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        lockdrop.storeMessage(VALID_KEY_CID, "", VALID_HASH, futureTimestamp, recipient.address)
      ).to.be.revertedWithCustomError(lockdrop, "InvalidMessageCID");
    });

    it("Should revert if message hash is too short", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, "short", futureTimestamp, recipient.address)
      ).to.be.revertedWithCustomError(lockdrop, "InvalidMessageHash");
    });

    it("Should revert if unlock timestamp is in the past", async function () {
      const pastTimestamp = (await time.latest()) - 3600;

      await expect(
        lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, pastTimestamp, recipient.address)
      ).to.be.revertedWithCustomError(lockdrop, "InvalidTimestamp");
    });

    it("Should revert if sender is recipient", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, owner.address)
      ).to.be.revertedWithCustomError(lockdrop, "SenderIsRecipient");
    });
  });

  describe("Get Message", function () {
    it("Should retrieve a stored message", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, recipient.address);

      const message = await lockdrop.getMessage(0);

      expect(message.encryptedKeyCid).to.equal(VALID_KEY_CID);
      expect(message.encryptedMessageCid).to.equal(VALID_MESSAGE_CID);
      expect(message.messageHash).to.equal(VALID_HASH);
      expect(message.sender).to.equal(owner.address);
      expect(message.recipient).to.equal(recipient.address);
    });

    it("Should revert if message not found", async function () {
      await expect(lockdrop.getMessage(999)).to.be.revertedWithCustomError(lockdrop, "MessageNotFound");
    });
  });

  describe("Get Sent Messages", function () {
    it("Should return all messages sent by an address", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, recipient.address);
      await lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, otherAccount.address);

      const sentMessages = await lockdrop.getSentMessages(owner.address);

      expect(sentMessages.length).to.equal(2);
      expect(sentMessages[0].recipient).to.equal(recipient.address);
      expect(sentMessages[1].recipient).to.equal(otherAccount.address);
    });
  });

  describe("Get Received Messages", function () {
    it("Should return all messages received by an address", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await lockdrop.storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, recipient.address);
      await lockdrop.connect(otherAccount).storeMessage(VALID_KEY_CID, VALID_MESSAGE_CID, VALID_HASH, futureTimestamp, recipient.address);

      const receivedMessages = await lockdrop.getReceivedMessages(recipient.address);

      expect(receivedMessages.length).to.equal(2);
      expect(receivedMessages[0].sender).to.equal(owner.address);
      expect(receivedMessages[1].sender).to.equal(otherAccount.address);
    });
  });
});
