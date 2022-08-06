// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./KryptoPunksToken.sol";

contract NFTVault {
    //--------------------------------------------------------------------
    // VARIABLES

    uint256 public totalItemsStaked;

    IERC721Enumerable nft;
    KryptoPunksToken token;

    struct Stake {
        address owner;
        uint256 stakedAt;
    }

    mapping(uint256 => Stake) vault;

    //--------------------------------------------------------------------
    // EVENTS

    event ItemStaked(uint256 tokenId, address owner, uint256 timestamp);
    event ItemUnstaked(uint256 tokenId, address owner, uint256 timestamp);
    event Claimed(address owner, uint256 reward);

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(address _nftAddress, address _token) {
        nft = IERC721Enumerable(_nftAddress);
        token = KryptoPunksToken(_token);
    }

    function stake(uint256[] calldata tokenIds) external {
        uint256 tokenId;
        uint256 stakedCount;

        for (uint256 i; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "Non Item Owner");
            require(vault[tokenId].owner == address(0), "Already Staked");

            nft.safeTransferFrom(msg.sender, address(this), tokenId);

            vault[tokenId] = Stake(msg.sender, block.timestamp);
            stakedCount++;

            emit ItemStaked(tokenId, msg.sender, block.timestamp);
        }
        totalItemsStaked = totalItemsStaked + stakedCount;
    }

    function unstake(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, true);
    }

    function claim(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, false);
    }

    function _claim(
        address user,
        uint256[] calldata tokenIds,
        bool unstake
    ) internal {
        uint256 tokenId;
        uint256 rewardEarned;

        for (uint256 i; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");
            uint256 _stakedAt = vault[tokenId].stakedAt;
            rewardEarned += (10 * (block.timestamp - _stakedAt)) / 1 days;
            vault[tokenId].stakedAt = block.timestamp;
        }
        emit Claimed(user, rewardEarned);

        if (rewardEarned != 0) {
            token.mint(user, rewardEarned);
        }

        if (unstake) {
            _unstake(user, tokenIds);
        }
    }

    function _unstake(address user, uint256[] calldata tokenIds) internal {
        uint256 tokenId;
        uint256 unstakedCount;

        for (uint256 i; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");

            nft.safeTransferFrom(address(this), user, tokenId);

            delete vault[tokenId];
            unstakedCount++;

            emit ItemUnstaked(tokenId, user, block.timestamp);
        }
        totalItemsStaked = totalItemsStaked - unstakedCount;
    }

    //--------------------------------------------------------------------
    // VIEW FUNCTIONS
}
