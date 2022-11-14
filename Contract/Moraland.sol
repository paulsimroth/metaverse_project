// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Moraland is ERC721URIStorage{
    constructor() ERC721("Moraland", "MLND") {}

    event Assigned(uint256 indexed tokenId, address indexed assignee);

    function assign(bytes calldata plotID) public {
        uint256 _tokenId = abi.decode(plotID, (uint256));
        _mint(msg.sender, _tokenId);
        emit Assigned(_tokenId, msg.sender);
    }
    
    function exist(bytes calldata bytesId) public view returns (bool){
        uint256 _tokenId = abi.decode(bytesId, (uint256));
        return _exists(_tokenId);
    }
}