const router = require("express").Router();
const Friend = require("../models/freinds");
const userSchema = require("../models/user");

// Add friend request
router.post("/addFriend", async (req, res) => {
  const { from, to } = req.body;

  try {
    const friendRequestExists = await Friend.exists({ from, to });

    if (friendRequestExists) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const newFriend = new Friend({
      from,
      to,
    });

    await newFriend.save();
    res.json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm friend request
router.put("/updateReq/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.query; // status 1 = accept, status 2 = reject

  try {
    const friendRequest = await Friend.findById(id);

    if (!friendRequest) {
      return res.status(400).json({ message: "Friend request does not exist" });
    }

    if (status === "1") {
      await Friend.findByIdAndUpdate(id, { status: "accepted" });
      return res.json({ message: "Friend request accepted" });
    } else if (status === "2") {
      await Friend.findByIdAndDelete(id);
      return res.json({ message: "Friend request rejected" });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all friends
router.get("/allFriends/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const friends = await Friend.find({
      $or: [{ from: id }, { to: id }],
      status: "accepted",
    }).populate("from to");

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending friend requests
router.get("/allReq/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const requests = await Friend.find({
      to: id,
      status: "pending",
    }).populate("from to");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove friend request
router.delete("/removeReq/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const friendRequest = await Friend.findById(id);

    if (!friendRequest) {
      return res.status(400).json({ message: "Friend request does not exist" });
    }

    await Friend.findByIdAndDelete(id);
    res.json({ message: "Friend request removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove friend
router.delete("/removeFriend/:userId/:friendId", async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    const friend = await Friend.findOneAndDelete({
      $or: [
        { from: userId, to: friendId, status: "accepted" },
        { from: friendId, to: userId, status: "accepted" },
      ],
    });

    if (!friend) {
      return res.status(400).json({ message: "Friend does not exist" });
    }

    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Friend suggestion
router.get("/suggestion/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const users = await userSchema.find({ _id: { $ne: id } });
    const friends = await Friend.find({
      $or: [{ from: id }, { to: id }],
    }).populate("from to");

    const suggestions = users.filter((user) => {
      const isFriend = friends.some(
        (friend) =>
          (friend.from._id.toString() === id &&
            friend.to._id.toString() === user._id.toString()) ||
          (friend.from._id.toString() === user._id.toString() &&
            friend.to._id.toString() === id)
      );

      return !isFriend;
    });

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
