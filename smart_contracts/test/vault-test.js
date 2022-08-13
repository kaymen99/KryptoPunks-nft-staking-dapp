const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getAmountInWei, getAmountFromWei } = require('../utils/helper-scripts');

describe("NFTStakingVault.sol", () => {
    let owner;
    let stakingVault;
    let nftContract;
    let tokenContract;

    const mintCost = getAmountInWei(0.01)
    const maxMintAmount = 3
    const maxSupply = 10000

    beforeEach(async () => {
        [owner, user1, user2, randomUser] = await ethers.getSigners()

        // Deploy KryptoPunks NFT contract 
        const NFTContract = await ethers.getContractFactory("KryptoPunks");
        nftContract = await NFTContract.deploy(maxSupply, mintCost, maxMintAmount);

        // Deploy KryptoPunks ERC20 token contract 
        const TokenContract = await ethers.getContractFactory("KryptoPunksToken");
        tokenContract = await TokenContract.deploy();

        // Deploy NFTStakingVault contract 
        const Vault = await ethers.getContractFactory("NFTStakingVault");
        stakingVault = await Vault.deploy(nftContract.address, tokenContract.address);
    });

    describe("Correct Deployement", () => {
        it("NFT contract should have correct owner address", async () => {
            const nftContractOnwer = await nftContract.owner();
            const ownerAddress = await owner.getAddress();
            expect(nftContractOnwer).to.equal(ownerAddress);
        });

        it("NFT contract should have correct initial parameters", async () => {
            expect(await nftContract.baseURI()).to.equal("");
            expect(await nftContract.cost()).to.equal(mintCost);
            expect(await nftContract.maxSupply()).to.equal(maxSupply);
            expect(await nftContract.maxMintAmountPerTx()).to.equal(maxMintAmount);
            expect(await nftContract.paused()).to.equal(1);

            await expect(nftContract.tokenURI(1)).to.be.revertedWithCustomError(nftContract, 'KryptoPunks__QueryForNonExistentToken');
        });

        it("ERC20 contract should have correct owner address", async () => {
            const tokenContractOnwer = await tokenContract.owner();
            const ownerAddress = await owner.getAddress();
            expect(tokenContractOnwer).to.equal(ownerAddress);
        });

        it("NFT Staking Vault contract should have correct owner address", async () => {
            const vaultOnwer = await stakingVault.owner();
            const ownerAddress = await owner.getAddress();
            expect(vaultOnwer).to.equal(ownerAddress);
        });
    });

    describe("Core Functions", () => {
        beforeEach(async () => {
            await nftContract.connect(owner).pause(2)

            await tokenContract.connect(owner).setController(stakingVault.address, true)
        });

        it("should allow user to mint NFTs", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            expect(await nftContract.totalSupply()).to.equal(3);
            expect(await nftContract.balanceOf(user1.address)).to.equal(3);
        });

        it("should allow user to stake its NFTs", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]
            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            await stakingVault.connect(user1).stake(tokenIds)

            expect(await nftContract.balanceOf(stakingVault.address)).to.equal(2);
            expect(await nftContract.balanceOf(user1.address)).to.equal(1);
            expect(await stakingVault.totalItemsStaked()).to.equal(2);
            expect(await stakingVault.balanceOf(user1.address)).to.equal(2);

            const userWallet = Array.from((await stakingVault.tokensOfOwner(user1.address)), x => Number(x))
            expect(userWallet).to.have.members(tokenIds);
        });

        it("should allow user to claim reward earned from staking", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]

            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            var userWallet = Array.from((await stakingVault.tokensOfOwner(user1.address)), x => Number(x))
            expect(userWallet).to.have.members([]);

            await stakingVault.connect(user1).stake(tokenIds)

            expect(await stakingVault.balanceOf(user1.address)).to.equal(2);
            userWallet = Array.from((await stakingVault.tokensOfOwner(user1.address)), x => Number(x))
            expect(userWallet).to.have.members(tokenIds);

            expect(await stakingVault.getTotalRewardEarned(user1.address)).to.equal(0);
            expect(await stakingVault.getRewardEarnedPerNft(tokenIds[0])).to.equal(0);

            // skip 5 days
            const waitingPeriod = 5 * 24 * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [waitingPeriod]);
            await ethers.provider.send('evm_mine');

            expect(
                Math.floor(getAmountFromWei(await stakingVault.getTotalRewardEarned(user1.address)))
            ).to.equal(50);
            expect(
                Math.floor(getAmountFromWei(await stakingVault.getRewardEarnedPerNft(tokenIds[0])))
            ).to.equal(25);

            await stakingVault.connect(user1).claim(tokenIds)

            const user1_tokenBalance = await tokenContract.balanceOf(user1.address)
            expect(
                Math.floor(getAmountFromWei(await tokenContract.totalSupply()))
            ).to.equal(50);
            expect(Math.floor(getAmountFromWei(user1_tokenBalance))).to.equal(50);
            expect(await stakingVault.getTotalRewardEarned(user1.address)).to.equal(0);
            expect(await stakingVault.getRewardEarnedPerNft(tokenIds[0])).to.equal(0);
        });

        it("should allow user to unstake his tokens", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]

            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }
            await stakingVault.connect(user1).stake(tokenIds)

            // skip 5 days
            const waitingPeriod = 5 * 24 * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [waitingPeriod]);
            await ethers.provider.send('evm_mine');

            await stakingVault.connect(user1).unstake(tokenIds)

            const user1_tokenBalance = await tokenContract.balanceOf(user1.address)
            expect(
                Math.floor(getAmountFromWei(await tokenContract.totalSupply()))
            ).to.equal(50);
            expect(Math.floor(getAmountFromWei(user1_tokenBalance))).to.equal(50);

            expect(await nftContract.balanceOf(stakingVault.address)).to.equal(0);
            expect(await nftContract.balanceOf(user1.address)).to.equal(3);
            expect(await stakingVault.balanceOf(user1.address)).to.equal(0);
        });

        it("should not allow user to mint NFT while contract is paused", async () => {
            await nftContract.connect(owner).pause(1)

            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3

            await expect(
                nftContract.connect(user1).mint(
                    3, { value: getAmountInWei(totalCost) }
                )
            ).to.be.revertedWithCustomError(
                nftContract, "KryptoPunks__ContractIsPaused"
            )
        });

        it("should not allow not NFT owner to stake his nfts", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]
            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            await expect(stakingVault.connect(user2).stake(tokenIds)).to.be.revertedWithCustomError(stakingVault, "NFTStakingVault__NotItemOwner")
        });

        it("should not allow user to stake same NFT twice", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]
            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            await stakingVault.connect(user1).stake(tokenIds)

            // skip 7 days
            const waitingPeriod = 7 * 24 * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [waitingPeriod]);
            await ethers.provider.send('evm_mine');

            await expect(stakingVault.connect(user1).stake([1])).to.be.revertedWithCustomError(stakingVault, "NFTStakingVault__ItemAlreadyStaked")
        });

        it("should not allow not NFT owner to claim staking reward", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]
            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            await stakingVault.connect(user1).stake(tokenIds)

            // skip 7 days
            const waitingPeriod = 7 * 24 * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [waitingPeriod]);
            await ethers.provider.send('evm_mine');

            await expect(stakingVault.connect(user2).claim(tokenIds)).to.be.revertedWithCustomError(stakingVault, "NFTStakingVault__NotItemOwner")
        });

        it("should not allow not NFT owner to unstake others NFTs", async () => {
            const mintCost = await nftContract.cost()
            const totalCost = getAmountFromWei(mintCost) * 3
            await nftContract.connect(user1).mint(3, { value: getAmountInWei(totalCost) })

            const tokenIds = [1, 3]
            for (let i = 0; i < tokenIds.length; i++) {
                await nftContract.connect(user1).approve(stakingVault.address, tokenIds[i])
            }

            await stakingVault.connect(user1).stake(tokenIds)

            // skip 7 days
            const waitingPeriod = 7 * 24 * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [waitingPeriod]);
            await ethers.provider.send('evm_mine');

            await expect(stakingVault.connect(user2).unstake(tokenIds)).to.be.revertedWithCustomError(stakingVault, "NFTStakingVault__NotItemOwner")
        });

        it("should not allow random users to mint KPT tokens", async () => {
            const amount = getAmountInWei(100)
            await expect(
                tokenContract.connect(randomUser).mint(randomUser.address, amount)
            ).to.be.revertedWithCustomError(tokenContract, "KryptoPunksToken__OnlyControllersCanMint")
        });
    });

    describe('Owner Functions', () => {
        it("only owner should be allowed to change NFT contract parametres & withdraw balance", async () => {
            await expect(nftContract.connect(randomUser).setCost(getAmountInWei(0.01))).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nftContract.connect(randomUser).setMaxMintAmountPerTx(10)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nftContract.connect(randomUser).setBaseURI('ipfs://new-Nft-Uri/')).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nftContract.connect(randomUser).pause(2)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(nftContract.connect(randomUser).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
        })

        it("only owner should be able to change change ERC20 contract controller", async () => {
            await expect(tokenContract.connect(randomUser).setController(user1.address, true)).to.be.revertedWith('Ownable: caller is not the owner');
        })

        it("owner should be able to withdraw NFT Contract balance", async () => {
            await nftContract.connect(owner).pause(2)

            // mint 5 items
            const mintCost = getAmountFromWei(await nftContract.cost())
            await nftContract.connect(randomUser).mint(2, { value: getAmountInWei(mintCost * 2) })

            const ownerInitialBalance = getAmountFromWei(await owner.getBalance())
            // withdraw full NFT Contract balance
            await (await nftContract.connect(owner).withdraw()).wait()
            const ownerFinalBalance = getAmountFromWei(await owner.getBalance())

            // withdraw call cost some gas so we to account for it
            expect(parseFloat(ownerFinalBalance).toFixed(2)).to.be.equal(
                parseFloat(ownerInitialBalance + mintCost * 2).toFixed(2)
            )
        })
    })
});
