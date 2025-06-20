// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LedgerDoc {
    enum UserStatus {
        Active,
        Suspended
    }
    enum DocumentStatus {
        Active,
        Removed
    }

    struct User {
        uint256 id;
        address wallet;
        string name;
        string profileCid;
        string profileImageCid;
        uint256 joinedAt;
        UserStatus status;
    }

    struct Document {
        uint256 id;
        string metadataCid;
        string encryptedCid;
        string descriptionCid;
        string previewCid;
        string thumbnailCid;
        string title;
        string[] categories;
        uint256 price;
        uint256 downloads;
        uint256 totalRating;
        uint256 ratingCount;
        uint256 uploaderId;
        uint256 uploadTime;
        DocumentStatus status;
    }

    struct Purchase {
        uint256 documentId;
        uint256 timestamp;
    }

    struct Sale {
        uint256 documentId;
        uint256 timestamp;
    }

    struct UserInput {
        address wallet;
        string name;
        string profileCid;
        string profileImageCid;
    }

    struct DocumentInput {
        string metadataCid;
        string encryptedCid;
        string descriptionCid;
        string previewCid;
        string thumbnailCid;
        string title;
        string[] categories;
        uint256 price;
        address uploaderAddress;
    }

    uint256 public nextUserId = 1;
    uint256 public nextDocumentId = 1;

    address public owner;

    mapping(address => uint256) public addressToUserId;
    mapping(uint256 => User) public users;
    mapping(uint256 => Document) public documents;
    mapping(address => bool) public isAuthorized;

    mapping(uint256 => Purchase[]) public userPurchases;
    mapping(uint256 => Sale[]) public userSales; //sales (current uploaded document that ment to get baugt  from the buyer )not sales history!!
    // Mapping for encrypted AES key CID on IPFS
    mapping(uint256 => string) public decryptionKeyCIDs;

    event UserRegistered(
        uint256 indexed userId,
        address indexed wallet,
        string name,
        string profileCid,
        string profileImageCid,
        uint256 joinedAt
    );
    event DocumentUploaded(
        uint256 indexed documentId,
        uint256 indexed uploaderId,
        string title,
        string[] categories,
        uint256 indexed price,
        uint256 uploadTime,
        string metadataCid,
        string encryptedCid,
        string descriptionCid,
        string previewCid,
        string thumbnailCid,
        string uploaderName
    );
    event DocumentCategoryTagged(uint256 indexed documentId, string category);
    event AuthorizationUpdated(address indexed uploader, bool status);
    event DocumentRemoved(uint256 indexed documentId);
    event UserStatusUpdated(uint256 indexed userId, UserStatus status);
    event DocumentPurchased(
        uint256 indexed documentId,
        uint256 indexed buyerId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            isAuthorized[msg.sender] || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    modifier onlyActiveUser(address userAddr) {
        uint256 uid = addressToUserId[userAddr];
        require(uid != 0, "Not registered");
        require(users[uid].status == UserStatus.Active, "User suspended");
        _;
    }

    constructor() {
        owner = msg.sender;
        isAuthorized[msg.sender] = true;
    }

    function setAuthorized(address uploader, bool status) external onlyOwner {
        isAuthorized[uploader] = status;
        emit AuthorizationUpdated(uploader, status);
    }

    function registerUser(UserInput calldata input) external onlyAuthorized {
        require(addressToUserId[input.wallet] == 0, "User exists");

        uint256 id = nextUserId++;
        users[id] = User({
            id: id,
            wallet: input.wallet,
            name: input.name,
            profileCid: input.profileCid,
            profileImageCid: input.profileImageCid,
            joinedAt: block.timestamp,
            status: UserStatus.Active
        });

        addressToUserId[input.wallet] = id;

        emit UserRegistered(
            id,
            input.wallet,
            input.name,
            input.profileCid,
            input.profileImageCid,
            block.timestamp
        );
    }

    function setUserStatus(
        uint256 userId,
        UserStatus status
    ) external onlyAuthorized {
        require(users[userId].id != 0, "Invalid user");
        users[userId].status = status;
        emit UserStatusUpdated(userId, status);
    }

    function uploadDocument(
        DocumentInput calldata input
    )
        external
        onlyAuthorized
        onlyActiveUser(input.uploaderAddress)
        returns (uint256)
    {
        //         require(users[input.uploaderId].id != 0, "Invalid uploader");
        uint256 uploaderId = addressToUserId[input.uploaderAddress];
        uint256 docId = nextDocumentId++;

        Document storage doc = documents[docId];
        doc.id = docId;
        doc.metadataCid = input.metadataCid;
        doc.encryptedCid = input.encryptedCid;
        doc.descriptionCid = input.descriptionCid;
        doc.previewCid = input.previewCid;
        doc.thumbnailCid = input.thumbnailCid;
        doc.title = input.title;
        doc.categories = input.categories;
        doc.price = input.price;
        doc.downloads = 0;
        doc.totalRating = 0;
        doc.ratingCount = 0;
        doc.uploaderId = uploaderId;
        doc.uploadTime = block.timestamp;
        doc.status = DocumentStatus.Active;

        userSales[uploaderId].push(
            Sale({documentId: docId, timestamp: block.timestamp})
        );

        emit DocumentUploaded(
            docId,
            uploaderId,
            input.title,
            input.categories,
            input.price,
            doc.uploadTime,
            input.metadataCid,
            input.encryptedCid,
            input.descriptionCid,
            input.previewCid,
            input.thumbnailCid,
            users[uploaderId].name
        );

        for (uint i = 0; i < input.categories.length; i++) {
            emit DocumentCategoryTagged(docId, input.categories[i]);
        }
        return docId;
    }

    function removeDocument(uint256 docId) external {
        Document storage doc = documents[docId];
        require(doc.id != 0, "Not found");
        uint256 uploaderId = doc.uploaderId;
        require(
            msg.sender == users[uploaderId].wallet || isAuthorized[msg.sender],
            "Unauthorized"
        );
        doc.status = DocumentStatus.Removed;
        emit DocumentRemoved(docId);
    }

    function purchaseDocument(
        uint256 docId
    ) external payable onlyActiveUser(msg.sender) {
        Document storage doc = documents[docId];
        require(doc.status == DocumentStatus.Active, "Document inactive");
        require(msg.value >= doc.price, "Insufficient payment");

        uint256 buyerId = addressToUserId[msg.sender];
        uint256 uploaderId = doc.uploaderId;

        // Check if user already purchased this document
        Purchase[] storage purchases = userPurchases[buyerId];
        for (uint i = 0; i < purchases.length; i++) {
            require(purchases[i].documentId != docId, "Already purchased");
        }

        userPurchases[buyerId].push(
            Purchase({documentId: docId, timestamp: block.timestamp})
        );
        //         userSales[uploaderId].push(Sale({ documentId: docId, timestamp: block.timestamp }));

        uint256 ownerCut = (msg.value * 10) / 100;
        uint256 sellerAmount = msg.value - ownerCut;

        payable(users[uploaderId].wallet).transfer(sellerAmount);
        doc.downloads += 1;
        emit DocumentPurchased(docId, buyerId, block.timestamp);
    }

    function getUserById(uint256 userId) external view returns (User memory) {
        require(userId != 0 && userId < nextUserId, "User not found");
        return users[userId];
    }

    function getUserByAddress(
        address wallet
    ) external view returns (User memory) {
        uint256 id = addressToUserId[wallet];
        require(id != 0, "User not found");
        return users[id];
    }

    function getDocument(
        uint256 docId
    ) external view returns (Document memory) {
        return documents[docId];
    }

    function getUserPurchases(
        uint256 userId
    ) external view returns (Purchase[] memory) {
        return userPurchases[userId];
    }

    function getUserSales(
        uint256 userId
    ) external view returns (Sale[] memory) {
        return userSales[userId];
    }

    function setDecryptionKeyCID( uint256 docId, string memory cid ) external onlyAuthorized {
    require(bytes(documents[docId].encryptedCid).length > 0, "Document not found");
    require(bytes(decryptionKeyCIDs[docId]).length == 0, "CID already set");
    decryptionKeyCIDs[docId] = cid;
}


// (Optional) Explicit getter
function getDecryptionKeyCID(
    uint256 docId
) external view returns (string memory) {
    return decryptionKeyCIDs[docId];
}

    function tst() public pure returns (uint256) {
        return 2222;
    }
}
