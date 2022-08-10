// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./interfaces/IKryptoPunks.sol";
import "./interfaces/IKryptoPunksToken.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTStakingVault is Ownable, IERC721Receiver {
    //--------------------------------------------------------------------
    // VARIABLES

    uint256 public totalItemsStaked;

    IKryptoPunks nft;
    IKryptoPunksToken token;

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

    constructor(address _nftAddress, address _tokenAddress) {
        nft = IKryptoPunks(_nftAddress);
        token = IKryptoPunksToken(_tokenAddress);
    }

    function stake(uint256[] calldata tokenIds) external {
        uint256 tokenId;
        uint256 stakedCount;

        for (uint256 i; i < tokenIds.length; ) {
            tokenId = tokenIds[i];
            require(vault[tokenId].owner == address(0), "Already Staked");
            require(nft.ownerOf(tokenId) == msg.sender, "Non Item Owner");

            nft.safeTransferFrom(msg.sender, address(this), tokenId);

            vault[tokenId] = Stake(msg.sender, block.timestamp);

            emit ItemStaked(tokenId, msg.sender, block.timestamp);

            unchecked {
                stakedCount++;
                ++i;
            }
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
        bool unstakeAll
    ) internal {
        uint256 tokenId;
        uint256 calculatedReward;
        uint256 rewardEarned;

        for (uint256 i; i < tokenIds.length; ) {
            tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");
            uint256 _stakedAt = vault[tokenId].stakedAt;
            calculatedReward += 200 * ((block.timestamp - _stakedAt) / 1 days);
            vault[tokenId].stakedAt = block.timestamp;
            unchecked {
                ++i;
            }
        }

        rewardEarned = calculatedReward / 100;

        emit Claimed(user, rewardEarned);

        if (rewardEarned != 0) {
            token.mint(user, rewardEarned);
        }

        if (unstakeAll) {
            _unstake(user, tokenIds);
        }
    }

    function _unstake(address user, uint256[] calldata tokenIds) internal {
        uint256 tokenId;
        uint256 unstakedCount;

        for (uint256 i; i < tokenIds.length; ) {
            tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");

            nft.safeTransferFrom(address(this), user, tokenId);

            delete vault[tokenId];

            emit ItemUnstaked(tokenId, user, block.timestamp);

            unchecked {
                unstakedCount++;
                ++i;
            }
        }
        totalItemsStaked = totalItemsStaked - unstakedCount;
    }

    //--------------------------------------------------------------------
    // VIEW FUNCTIONS

    function getTotalRewardEarned(address user)
        external
        view
        returns (uint256)
    {
        uint256 calculatedReward;
        uint256 rewardEarned = 0;
        uint256[] memory tokens = tokensOfOwner(user);
        if (tokens.length != 0) {
            for (uint256 i; i < tokens.length; ) {
                uint256 _stakedAt = vault[tokens[i]].stakedAt;
                calculatedReward +=
                    200 *
                    ((block.timestamp - _stakedAt) / 1 days);
                unchecked {
                    ++i;
                }
            }
            rewardEarned = calculatedReward / 100;
        }
        return rewardEarned;
    }

    function getRewardEarnedPerNft(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        uint256 calculatedReward;
        uint256 rewardEarned;
        uint256 _stakedAt = vault[_tokenId].stakedAt;
        calculatedReward = 200 * ((block.timestamp - _stakedAt) / 1 days);
        rewardEarned = calculatedReward / 100;
        return rewardEarned;
    }

    function balanceOf(address user) public view returns (uint256) {
        uint256 nftStakedbalance;
        uint256 supply = nft.totalSupply();
        for (uint256 i = 1; i <= supply; ++i) {
            if (vault[i].owner == user) {
                nftStakedbalance += 1;
            }
        }
        return nftStakedbalance;
    }

    function tokensOfOwner(address user)
        public
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(user);
        uint256 supply = nft.totalSupply();
        uint256[] memory tokens = new uint256[](balance);

        uint256 counter;

        if (balance == 0) {
            return tokens;
        }

        for (uint256 i = 1; i <= supply; ++i) {
            if (vault[i].owner == user) {
                tokens[counter] = i;
                counter++;
            }
            if (counter == balance) {
                return tokens;
            }
        }
        return tokens;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
