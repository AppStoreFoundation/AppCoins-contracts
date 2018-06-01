pragma solidity ^0.4.19;


library CampaignLibrary {

    struct Filters {
        string countries;
        string packageName;
        uint[] vercodes;
    }

    struct Campaign {
        bytes32 bidId;
        uint price;
        uint budget;
        uint startDate;
        uint endDate;
        bool valid;
        address  owner;
        Filters filters;
        string ipValidator;
    }
}
