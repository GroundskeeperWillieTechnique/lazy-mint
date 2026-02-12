// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract LazyLaunchpad is ERC721, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 public shuffleFee = 0.0001 ether; // Example fee
    uint256 public mintPrice = 0.001 ether;  // Example price
    uint256 public maxSupply = 1000;
    uint256 public totalMinted;

    address public signerAddress;

    mapping(bytes32 => bool) public mintedCombos;
    mapping(address => uint256) public shuffleCredits;

    event Shuffled(address indexed user, uint256 newCredits);
    event Minted(address indexed user, uint256 tokenId, bytes32 traitHash);

    constructor(address _signerAddress) ERC721("LazyMinter", "LAZY") Ownable(msg.sender) {
        signerAddress = _signerAddress;
    }

    function setSignerAddress(address _signerAddress) external onlyOwner {
        signerAddress = _signerAddress;
    }

    function setFees(uint256 _shuffleFee, uint256 _mintPrice) external onlyOwner {
        shuffleFee = _shuffleFee;
        mintPrice = _mintPrice;
    }

    function purchaseShuffle() external payable {
        require(msg.value >= shuffleFee, "Insufficient shuffle fee");
        shuffleCredits[msg.sender]++;
        emit Shuffled(msg.sender, shuffleCredits[msg.sender]);
    }

    function mint(bytes32 traitHash, bytes memory signature) external payable {
        require(totalMinted < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient mint price");
        require(shuffleCredits[msg.sender] > 0, "No shuffle credits");
        require(!mintedCombos[traitHash], "Trait combo already minted");

        // Verify signature from backend
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, traitHash)).toEthSignedMessageHash();
        require(messageHash.recover(signature) == signerAddress, "Invalid signature");

        mintedCombos[traitHash] = true;
        shuffleCredits[msg.sender]--;
        
        totalMinted++;
        _safeMint(msg.sender, totalMinted);

        emit Minted(msg.sender, totalMinted, traitHash);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
