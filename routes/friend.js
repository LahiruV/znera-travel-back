const router = require("express").Router();
const Friend = require("../models/freinds");
const userSchema = require("../models/user");
const auth = require("../middleware/auth");

// Add friend request
router.post("/addFriend",auth, async (req, res) => {
  const { from, to } = req.body;

  try {
    const newFriend = new Friend({
      from,
      to,
    });

    const friendRequest = await Friend.find({
      from,
      to,
    });

    if (friendRequest.length > 0) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    await newFriend.save();

    res.json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// confirm friend request
router.put("/updateReq/:id",auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  // status 1 = accept, status 2 = reject

  try {
    const isReqExist = await Friend.findById(id);

    // check if friend request exists
    if (!isReqExist) {
      return res.status(400).json({ message: "Friend request does not exist" });
    }
    let message = "";
    // check if status is valid
    if (status === "1") {
      await Friend.findByIdAndUpdate(id, { status: "accepted" });
      message = "Friend request accepted";
    } else if (status === "2") {
      await Friend.findByIdAndDelete(id);
      message = "Friend request rejected";
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all friends
router.get("/allFriends/:id",auth, async (req, res) => {
  const { id } = req.params;
  try {
    const friends = await Friend.find({
      $or: [{ from: id }, { to: id }],
      status: "accepted",
    }).populate("from to");

    res.json({ friends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all pending friend requests
router.get("/allReq/:id",auth, async (req, res) => {
  const { id } = req.params;
  try {
    const requests = await Friend.find({
      to: id,
      status: "pending",
    }).populate("from to");

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// remove friend request
router.delete("/removeReq/:id",auth, async (req, res) => {
  const { id } = req.params;

  try {
    const isReqExist = await Friend.findById(id);

    // check if friend request exists
    if (!isReqExist) {
      return res.status(400).json({ message: "Friend request does not exist" });
    }

    await Friend.findByIdAndDelete(id);

    res.json({ message: "Friend request removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// remove friend
router.delete("/removeFriend/:id",auth, async (req, res) => {
  const { id } = req.params;

  try {
    const isFriendExist = await Friend.find({
      $or: [{ from: id }, { to: id }],
      status: "accepted",
    });

    // check if friend exists
    if (!isFriendExist) {
      return res.status(400).json({ message: "Friend does not exist" });
    }

    await Friend.findByIdAndDelete(id);

    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Friend Suggestion
router.get("/suggestion/:id",auth, async (req, res) => {
  const { id } = req.params;

  try {
    // get all users expect the current user
    const users = await userSchema.find({ _id: { $ne: id } });
    // get all friends request  of the current user
    const friends = await Friend.find({
      $or: [{ from: id }, { to: id }],
    }).populate("from to");

    let friendList = [];

    users.forEach((user) => {
      // check if the user is already a friend
      const isFriend = friends.find((friend) => {
        return (
          (friend.from._id.toString() === id &&
            friend.to._id.toString() === user._id.toString()) ||
          (friend.from._id.toString() === user._id.toString() &&
            friend.to._id.toString() === id)
        );
      });

      if (!isFriend) {
        friendList.push({ user });
      } else {
        if (isFriend.status === "pending") {
          friendList.push({ user, isFriend });
        }
      }
    });

    res.json({ friendList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
