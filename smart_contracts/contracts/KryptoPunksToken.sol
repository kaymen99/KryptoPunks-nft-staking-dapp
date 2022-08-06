// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract KryptoPunksToken is ERC20, ERC20Burnable, Ownable {
    mapping(address => bool) controllers;

    constructor() ERC20("Krypto Punks Token", "KPT") {}

    function mint(address to, uint256 amount) public {
        require(controllers[msg.sender], "Only controllers can mint");
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        if (controllers[msg.sender]) {
            _burn(account, amount);
        } else {
            super.burnFrom(account, amount);
        }
    }

    function setController(address controller, bool _state)
        external
        payable
        onlyOwner
    {
        controllers[controller] = _state;
    }
}
