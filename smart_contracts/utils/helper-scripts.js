const { ethers } = require("hardhat");

const developmentChains = ["hardhat", "localhost", "ganache"]

function getAmountInWei(amount) {
    return ethers.utils.parseEther(amount.toString(), "ether")
}
function getAmountFromWei(amount) {
    return Number(ethers.utils.formatUnits(amount.toString(), "ether"))
}

async function moveTime(period) {
    await ethers.provider.send('evm_increaseTime', [period]);
    await ethers.provider.send('evm_mine');
}

module.exports = {
    developmentChains,
    getAmountFromWei,
    getAmountInWei,
    moveTime
}
