const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SovSeal", function () {
  let sovseal;
  let owner;
  let recipient;
  let otherAccount;

  const VALID_KEY_CID = "QmTest123KeyCID";
  const VALID_MESSAGE_CID = "QmTest456MessageCID";
  const VALID_HASH = "a".repeat(64);

  beforeEach(async function () {
    [owner, recipient, otherAccount] = await ethers.getSigners();

    const SovSeal = await ethers.getContractFactory("Lockdrop");
    sovseal = await SovSeal.deploy();
    await sovseal.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero message count", async function () {
      expect(await sovseal.getMessageCount()).to.equal(0);
    });
  });

  describe("Store Message", function () {
    it("Should store a message successfully", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      const tx = await sovseal.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        recipient.address
      );

      await expect(tx)
        .to.emit(sovseal, "MessageStored")
        .withArgs(0, owner.address, recipient.address, futureTimestamp);

      expect(await sovseal.getMessageCount()).to.equal(1);
    });

    it("Should revert if key CID is empty", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        sovseal.storeMessage(
          "",
          VALID_MESSAGE_CID,
          VALID_HASH,
          futureTimestamp,
          recipient.address
        )
      ).to.be.revertedWithCustomError(sovseal, "InvalidKeyCID");
    });

    it("Should revert if message CID is empty", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        sovseal.storeMessage(
          VALID_KEY_CID,
          "",
          VALID_HASH,
          futureTimestamp,
          recipient.address
        )
      ).to.be.revertedWithCustomError(sovseal, "InvalidMessageCID");
    });

    it("Should revert if message hash is too short", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        sovseal.storeMessage(
          VALID_KEY_CID,
          VALID_MESSAGE_CID,
          "short",
          futureTimestamp,
          recipient.address
        )
      ).to.be.revertedWithCustomError(sovseal, "InvalidMessageHash");
    });

    it("Should revert if unlock timestamp is in the past", async function () {
      const pastTimestamp = (await time.latest()) - 3600;

      await expect(
        sovseal.storeMessage(
          VALID_KEY_CID,
          VALID_MESSAGE_CID,
          VALID_HASH,
          pastTimestamp,
          recipient.address
        )
      ).to.be.revertedWithCustomError(sovseal, "InvalidTimestamp");
    });

    it("Should revert if sender is recipient", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await expect(
        sovseal.storeMessage(
          VALID_KEY_CID,
          VALID_MESSAGE_CID,
          VALID_HASH,
          futureTimestamp,
          owner.address
        )
      ).to.be.revertedWithCustomError(sovseal, "SenderIsRecipient");
    });
  });

  describe("Get Message", function () {
    it("Should retrieve a stored message", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await sovseal.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        recipient.address
      );

      const message = await sovseal.getMessage(0);

      expect(message.encryptedKeyCid).to.equal(VALID_KEY_CID);
      expect(message.encryptedMessageCid).to.equal(VALID_MESSAGE_CID);
      expect(message.messageHash).to.equal(VALID_HASH);
      expect(message.sender).to.equal(owner.address);
      expect(message.recipient).to.equal(recipient.address);
    });

    it("Should revert if message not found", async function () {
      await expect(sovseal.getMessage(999)).to.be.revertedWithCustomError(
        sovseal,
        "MessageNotFound"
      );
    });
  });

  describe("Get Sent Messages", function () {
    it("Should return all messages sent by an address", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await sovseal.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        recipient.address
      );
      await sovseal.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        otherAccount.address
      );

      const sentMessages = await sovseal.getSentMessages(owner.address);

      expect(sentMessages.length).to.equal(2);
      expect(sentMessages[0].recipient).to.equal(recipient.address);
      expect(sentMessages[1].recipient).to.equal(otherAccount.address);
    });
  });

  describe("Get Received Messages", function () {
    it("Should return all messages received by an address", async function () {
      const futureTimestamp = (await time.latest()) + 3600;

      await sovseal.storeMessage(
        VALID_KEY_CID,
        VALID_MESSAGE_CID,
        VALID_HASH,
        futureTimestamp,
        recipient.address
      );
      await sovseal
        .connect(otherAccount)
        .storeMessage(
          VALID_KEY_CID,
          VALID_MESSAGE_CID,
          VALID_HASH,
          futureTimestamp,
          recipient.address
        );

      const receivedMessages = await sovseal.getReceivedMessages(
        recipient.address
      );

      expect(receivedMessages.length).to.equal(2);
      expect(receivedMessages[0].sender).to.equal(owner.address);
      expect(receivedMessages[1].sender).to.equal(otherAccount.address);
    });
  });
});
