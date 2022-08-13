// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract KryptoPunks is ERC721Enumerable, Ownable {
    using Strings for uint256;

    //--------------------------------------------------------------------
    // VARIABLES

    string public baseURI;
    string public constant baseExtension = ".json";

    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMintAmountPerTx;

    // USE uint256 instead of bool to save gas
    // paused = 1 & active = 2
    uint256 public paused = 1;

    //--------------------------------------------------------------------
    // ERRORS

    error KryptoPunks__ContractIsPaused();
    error KryptoPunks__NftSupplyLimitExceeded();
    error KryptoPunks__InvalidMintAmount();
    error KryptoPunks__MaxMintAmountExceeded();
    error KryptoPunks__InsufficientFunds();
    error KryptoPunks__QueryForNonExistentToken();

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(
        uint256 _maxSupply,
        uint256 _cost,
        uint256 _maxMintAmountPerTx
    ) ERC721("Krypto Punks Collectible", "KPC") {
        cost = _cost;
        maxMintAmountPerTx = _maxMintAmountPerTx;
        maxSupply = _maxSupply;
    }

    //--------------------------------------------------------------------
    // MINT FUNCTIONS

    function mint(uint256 _mintAmount) external payable {
        if (paused == 1) revert KryptoPunks__ContractIsPaused();
        if (_mintAmount == 0) revert KryptoPunks__InvalidMintAmount();
        if (_mintAmount > maxMintAmountPerTx)
            revert KryptoPunks__MaxMintAmountExceeded();
        uint256 supply = totalSupply();
        if (supply + _mintAmount > maxSupply)
            revert KryptoPunks__NftSupplyLimitExceeded();

        if (msg.sender != owner()) {
            if (msg.value < cost * _mintAmount)
                revert KryptoPunks__InsufficientFunds();
        }

        for (uint256 i = 1; i <= _mintAmount; ) {
            _safeMint(msg.sender, supply + i);
            unchecked {
                ++i;
            }
        }
    }

    //--------------------------------------------------------------------
    // OWNER FUNCTIONS

    function setCost(uint256 _newCost) external payable onlyOwner {
        cost = _newCost;
    }

    function setMaxMintAmountPerTx(uint256 _newmaxMintAmount)
        external
        payable
        onlyOwner
    {
        maxMintAmountPerTx = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) external payable onlyOwner {
        baseURI = _newBaseURI;
    }

    function pause(uint256 _state) external payable onlyOwner {
        paused = _state;
    }

    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
    }

    //--------------------------------------------------------------------
    // VIEW FUNCTIONS

    function walletOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; ) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
            unchecked {
                ++i;
            }
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert KryptoPunks__QueryForNonExistentToken();

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
