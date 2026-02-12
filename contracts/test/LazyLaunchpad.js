const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LazyLaunchpad", function () {
  let LazyLaunchpad;
  let lazyLaunchpad;
  let owner;
  let signer;
  let user;
  let shuffleFee = ethers.parseEther("0.0001");
  let mintPrice = ethers.parseEther("0.001");

  beforeEach(async function () {
    [owner, signer, user] = await ethers.getSigners();
    LazyLaunchpad = await ethers.getContractFactory("LazyLaunchpad");
    lazyLaunchpad = await LazyLaunchpad.deploy(signer.address);
  });

  it("Should allow purchasing shuffles", async function () {
    await lazyLaunchpad.connect(user).purchaseShuffle({ value: shuffleFee });
    expect(await lazyLaunchpad.shuffleCredits(user.address)).to.equal(1);
  });

  it("Should allow minting with a valid signature", async function () {
    await lazyLaunchpad.connect(user).purchaseShuffle({ value: shuffleFee });
    
    const traitHash = ethers.keccak256(ethers.toUtf8Bytes("round-glasses-red-hat"));
    
    // Prepare message for signing
    const message = ethers.solidityPackedKeccak256(
      ["address", "bytes32"],
      [user.address, traitHash]
    );
    const signature = await signer.signMessage(ethers.toBeArray(message));

    await expect(lazyLaunchpad.connect(user).mint(traitHash, signature, { value: mintPrice }))
      .to.emit(lazyLaunchpad, "Minted")
      .withArgs(user.address, 1, traitHash);

    expect(await lazyLaunchpad.balanceOf(user.address)).to.equal(1);
    expect(await lazyLaunchpad.shuffleCredits(user.address)).to.equal(0);
  });

  it("Should fail minting with invalid signature", async function () {
    await lazyLaunchpad.connect(user).purchaseShuffle({ value: shuffleFee });
    
    const traitHash = ethers.keccak256(ethers.toUtf8Bytes("round-glasses-red-hat"));
    const message = ethers.solidityPackedKeccak256(
      ["address", "bytes32"],
      [user.address, traitHash]
    );
    // Sign with wrong signer (user instead of signer)
    const signature = await user.signMessage(ethers.toBeArray(message));

    await expect(lazyLaunchpad.connect(user).mint(traitHash, signature, { value: mintPrice }))
      .to.be.revertedWith("Invalid signature");
  });

  it("Should fail minting without shuffle credits", async function () {
    const traitHash = ethers.keccak256(ethers.toUtf8Bytes("round-glasses-red-hat"));
    const message = ethers.solidityPackedKeccak256(
      ["address", "bytes32"],
      [user.address, traitHash]
    );
    const signature = await signer.signMessage(ethers.toBeArray(message));

    await expect(lazyLaunchpad.connect(user).mint(traitHash, signature, { value: mintPrice }))
      .to.be.revertedWith("No shuffle credits");
  });
});
