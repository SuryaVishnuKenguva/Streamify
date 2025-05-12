import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "This user is already your friend." });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists." });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: {friends: friendRequest.recipient}
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: {friends: friendRequest.sender}
    });

    res.status(200).json({message: "Friend Request Accepted"});

  } catch (error) {
    console.error("Error in acceptFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req,res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    // Get accepted requests where user is recipient
    const acceptedAsRecipient = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");
    
    // Get accepted requests where user is sender
    const acceptedAsSender = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted"
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");
    
    // Combine both types of accepted requests
    const acceptedRequests = [
      ...acceptedAsRecipient.map(req => ({
        ...req.toObject(),
        userType: 'recipient',
        otherUser: req.sender
      })),
      ...acceptedAsSender.map(req => ({
        ...req.toObject(),
        userType: 'sender',
        otherUser: req.recipient
      }))
    ];

    res.status(200).json({incomingRequests, acceptedRequests});
  } catch (error) {
    console.error("Error in getFriendRequests Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingRequests(req,res){
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending"
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingRequests Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}