// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LedgerDoc {
    struct Document {
        uint256 id;
        string metadataCid;
        string encryptedCid;
        string descriptionCid;
        string previewCid;
        string thumbnailCid;
        string title;
        string category;
        uint256 price;
        uint256 downloads;
        uint256 totalRating;
        uint256 ratingCount;
        uint256 uploaderId;
        bool previewAvailable;
    }

    struct User {
        uint256 id;
        address wallet;
        string name;
        string profileCid;
    }

    uint256 public nextUserId = 1;
    uint256 public nextDocumentId = 1;

    mapping(address => uint256) public addressToUserId;
    mapping(uint256 => User) public users;
    mapping(uint256 => Document) public documents;
    mapping(address => bool) public isAuthorizedUploader;

    address public owner;

    event UserRegistered(uint256 indexed userId, address wallet);
    event DocumentUploaded(uint256 indexed documentId, uint256 indexed uploaderId);
    event AuthorizationUpdated(address indexed uploader, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(isAuthorizedUploader[msg.sender], "Not authorized to upload");
        _;
    }

    modifier onlyRegisteredUser() {
        require(addressToUserId[msg.sender] != 0, "Not a registered user");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Admin: authorize or revoke uploader rights
    function setAuthorizedUploader(address uploader, bool status) external onlyOwner {
        isAuthorizedUploader[uploader] = status;
        emit AuthorizationUpdated(uploader, status);
    }

    // Admin: register a new user
    function registerUser(address wallet, string calldata name, string calldata profileCid) external onlyOwner {
        require(addressToUserId[wallet] == 0, "User already registered");
        uint256 userId = nextUserId++;

        users[userId] = User({
            id: userId,
            wallet: wallet,
            name: name,
            profileCid: profileCid
        });

        addressToUserId[wallet] = userId;
        emit UserRegistered(userId, wallet);
    }

    // Authorized + registered users can upload documents
    function uploadDocument(
        string calldata metadataCid,
        string calldata encryptedCid,
        string calldata descriptionCid,
        string calldata previewCid,
        string calldata thumbnailCid,
        string calldata title,
        string calldata category,
        uint256 price,
        bool previewAvailable
    ) external onlyAuthorized onlyRegisteredUser {
        uint256 docId = nextDocumentId++;
        uint256 uploaderId = addressToUserId[msg.sender];

        documents[docId] = Document({
            id: docId,
            metadataCid: metadataCid,
            encryptedCid: encryptedCid,
            descriptionCid: descriptionCid,
            previewCid: previewCid,
            thumbnailCid: thumbnailCid,
            title: title,
            category: category,
            price: price,
            downloads: 0,
            totalRating: 0,
            ratingCount: 0,
            uploaderId: uploaderId,
            previewAvailable: previewAvailable
        });

        emit DocumentUploaded(docId, uploaderId);
    }

    // View a user by ID
    function getUserById(uint256 userId) external view returns (User memory) {
        require(userId != 0 && userId < nextUserId, "User does not exist");
        return users[userId];
    }

    // View a user by wallet address
    function getUserByAddress(address wallet) external view returns (User memory) {
        uint256 id = addressToUserId[wallet];
        require(id != 0, "User not found");
        return users[id];
    }

    // View a document
    function getDocument(uint256 documentId) external view returns (Document memory) {
        return documents[documentId];
    }
}
