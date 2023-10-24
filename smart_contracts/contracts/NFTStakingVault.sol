// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IKryptoPunksToken.sol";
import "./interfaces/IKryptoPunks.sol";

/// @title the KryptoPunks NFT staking vault
/// @author kaymen99
/// @notice this vault allwos users to stake their KryptoPunks tokens and earn daily rewards
/// based on their overall staking period, the rewards are distributed in the form of our own ERC20 token 'KryptoPunksToken'
/// @dev this contract must be set as controller in the 'KryptoPunksToken' contract to enable ERC20 rewards minting
/// @dev the daily reward logic is hadcoded  based on predefined staking period (see _calculateReward) and cannot be changed after deployment
contract NFTStakingVault is IERC721Receiver {
    // *********** //
    //  VARIABLES  //
    // *********** //

    // total count of NFT staked in this Vault by all users
    uint256 public totalItemsStaked;
    uint256 private constant MONTH = 30 days;

    IKryptoPunks immutable nft;
    IKryptoPunksToken immutable token;

    struct Stake {
        // packed to save gas
        address owner;
        uint64 stakedAt;
    }

    // tokenId => Stake
    mapping(uint256 => Stake) vault;

    // ******** //
    //  EVENTS  //
    // ******** //

    event ItemsStaked(uint256[] tokenId, address owner);
    event ItemsUnstaked(uint256[] tokenIds, address owner);
    event Claimed(address owner, uint256 reward);

    // ******** //
    //  ERRORS  //
    // ******** //

    error NFTStakingVault__ItemAlreadyStaked();
    error NFTStakingVault__NotItemOwner();

    constructor(address _nftAddress, address _tokenAddress) {
        nft = IKryptoPunks(_nftAddress);
        token = IKryptoPunksToken(_tokenAddress);
    }

    // *********** //
    //  FUNCTIONS  //
    // *********** //

    /// @notice allow caller to stake multiple NFTs
    /// @dev only NFT owner should be able to call this, should have approved ERC721 transfer
    /// @param tokenIds array of token ids (uint256) to be staked
    function stake(uint256[] calldata tokenIds) external {
        uint256 stakedCount = tokenIds.length;

        for (uint256 i; i < stakedCount; ) {
            uint256 tokenId = tokenIds[i];
            if (vault[tokenId].owner != address(0)) {
                revert NFTStakingVault__ItemAlreadyStaked();
            }
            if (nft.ownerOf(tokenId) != msg.sender) {
                revert NFTStakingVault__NotItemOwner();
            }

            nft.safeTransferFrom(msg.sender, address(this), tokenId);
            vault[tokenId] = Stake(msg.sender, uint64(block.timestamp));

            unchecked {
                ++i;
            }
        }
        totalItemsStaked = totalItemsStaked + stakedCount;

        // emit final event after for loop to save gas
        emit ItemsStaked(tokenIds, msg.sender);
    }

    /// @notice allow caller to unstake multiple NFTs white also claiming any accrued rewards
    /// @dev only NFTs owner should be able to call this
    /// @param tokenIds array of token ids (uint256) to be unstaked
    function unstake(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, true);
    }

    /// @notice allow caller to claim accrued rewards on staked NFTs
    /// @dev only NFT owner should be able to call this, will not unstake NFTs
    /// @param tokenIds array of token ids (uint256) to claim rewards for
    function claim(uint256[] calldata tokenIds) external {
        _claim(msg.sender, tokenIds, false);
    }

    /// @notice internal function to claim user rewards accrued
    /// @dev calculate rewards based on staking period of each token using '_calculateReward'
    /// @dev reward formula should be : earned = (now - stakedAt) * _calculateReward(now - stakedAt)
    /// @param user address of user to claim for, must be owner of tokenIds
    /// @param tokenIds array of token ids (uint256) to claim rewards for
    /// @param unstakeAll bool true if user wants to unstake, false otherwise
    function _claim(
        address user,
        uint256[] calldata tokenIds,
        bool unstakeAll
    ) internal {
        uint256 tokenId;
        uint256 rewardEarned;
        uint256 len = tokenIds.length;

        for (uint256 i; i < len; ) {
            tokenId = tokenIds[i];
            if (vault[tokenId].owner != user) {
                revert NFTStakingVault__NotItemOwner();
            }
            uint256 _stakedAt = uint256(vault[tokenId].stakedAt);

            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 _dailyReward = _calculateReward(stakingPeriod);
            rewardEarned += (_dailyReward * stakingPeriod * 1e18) / 1 days;

            vault[tokenId].stakedAt = uint64(block.timestamp);

            unchecked {
                ++i;
            }
        }

        if (rewardEarned != 0) {
            token.mint(user, rewardEarned);
            emit Claimed(user, rewardEarned);
        }

        if (unstakeAll) {
            _unstake(user, tokenIds);
        }
    }

    /// @notice internal function to unstake user staked tokens
    /// @dev will not claim rewards, should always be called after claiming
    /// @param user address of user to unstake for
    /// @param tokenIds array of token ids (uint256) to unstake
    function _unstake(address user, uint256[] calldata tokenIds) internal {
        uint256 unstakedCount = tokenIds.length;
        for (uint256 i; i < unstakedCount; ) {
            uint256 tokenId = tokenIds[i];
            require(vault[tokenId].owner == user, "Not Owner");

            delete vault[tokenId];
            nft.safeTransferFrom(address(this), user, tokenId);

            unchecked {
                ++i;
            }
        }
        totalItemsStaked = totalItemsStaked - unstakedCount;

        // emit final event after for loop to save gas
        emit ItemsUnstaked(tokenIds, user);
    }

    /// @notice internal function to get daily staking rewards
    /// @dev calculate the daily reward based on the NFT staking period using pre-defined logic
    /// @param stakingPeriod time period during which the NFT was stake
    function _calculateReward(
        uint256 stakingPeriod
    ) internal pure returns (uint256 dailyReward) {
        if (stakingPeriod <= MONTH) {
            dailyReward = 1;
        } else if (stakingPeriod < 3 * MONTH) {
            dailyReward = 2;
        } else if (stakingPeriod < 6 * MONTH) {
            dailyReward = 4;
        } else if (stakingPeriod >= 6 * MONTH) {
            dailyReward = 8;
        }
    }

    // ********* //
    //  GETTERS  //
    // ********* //

    /// @notice returns daily reward earned given token staking period
    /// @dev calls _calculateReward function
    /// @param stakingPeriod time period during which the NFT was stake
    /// @return dailyReward daily reward based on staking period
    function getDailyReward(
        uint256 stakingPeriod
    ) external pure returns (uint256 dailyReward) {
        dailyReward = _calculateReward(stakingPeriod);
    }

    /// @notice get the total rewards accrued by all tokens staked by user
    /// @dev uses same reward formula implemented in "_claim"
    /// @param user address of tokens owner
    /// @return rewardEarned total reward accrued by user's staked token
    function getTotalRewardEarned(
        address user
    ) external view returns (uint256 rewardEarned) {
        uint256[] memory tokens = tokensOfOwner(user);

        uint256 len = tokens.length;
        for (uint256 i; i < len; ) {
            uint256 _stakedAt = uint256(vault[tokens[i]].stakedAt);
            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 _dailyReward = _calculateReward(stakingPeriod);
            rewardEarned += (_dailyReward * stakingPeriod * 1e18) / 1 days;
            unchecked {
                ++i;
            }
        }
    }

    /// @notice get rewards accrued by a given staked token
    /// @dev uses same reward formula implemented in "_claim"
    /// @param _tokenId id of the token for which reward calculation is needed
    /// @return rewardEarned reward accrued by _tokenId
    function getRewardEarnedPerNft(
        uint256 _tokenId
    ) external view returns (uint256 rewardEarned) {
        uint256 _stakedAt = uint256(vault[_tokenId].stakedAt);
        uint256 stakingPeriod = block.timestamp - _stakedAt;
        uint256 _dailyReward = _calculateReward(stakingPeriod);
        rewardEarned = (_dailyReward * stakingPeriod * 1e18) / 1 days;
    }

    /// @notice returns count of token staked by user
    /// @param user address of tokens owner
    /// @return nftStakedbalance number of NFTs staked by user
    function balanceOf(
        address user
    ) public view returns (uint256 nftStakedbalance) {
        uint256 supply = nft.totalSupply();
        unchecked {
            for (uint256 i; i <= supply; ++i) {
                if (vault[i].owner == user) {
                    nftStakedbalance += 1;
                }
            }
        }
    }

    /// @notice returns all tokens staked by the user
    /// @param user address of tokens owner
    /// @return tokens array of token Ids (uint256) staked by the user
    function tokensOfOwner(
        address user
    ) public view returns (uint256[] memory tokens) {
        uint256 balance = balanceOf(user);
        if (balance == 0) return tokens;
        uint256 supply = nft.totalSupply();
        tokens = new uint256[](balance);

        uint256 counter;
        unchecked {
            for (uint256 i; i <= supply; ++i) {
                if (vault[i].owner == user) {
                    tokens[counter] = i;
                    counter++;
                    if (counter == balance) return tokens;
                }
            }
        }
    }

    /// @notice allow vault contract (address(this)) to receive ERC721 tokens
    function onERC721Received(
        address /**operator*/,
        address /**from*/,
        uint256 /**amount*/,
        bytes calldata //data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
