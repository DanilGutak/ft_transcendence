// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    struct Tournament {
        uint256 id;
        string place1;
        string place2;
        string place3;
        string place4;
    }
    mapping(uint256 => Tournament) public tournaments;
    uint256 public count;

    function addTournament(
        string memory place1, 
        string memory place2, 
        string memory place3, 
        string memory place4
    ) public {
        count++;
        tournaments[count] = Tournament(count, place1, place2, place3, place4);
    }

    function getTournament(uint256 id) public view
    returns (
        uint256 , 
        string memory, 
        string memory, 
        string memory, 
        string memory
    )
    {
        Tournament memory t = tournaments[id];
        return (t.id, t.place1, t.place2, t.place3, t.place4);
    }
}
