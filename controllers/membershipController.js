import Membership from "../models/Membership.js";

export const createOrUpdateMembership = async (req, res) => {
  try {
    const { userId, planName, price, durationDays } = req.body;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    let membership = await Membership.findOne({ userId });

    if (membership) {
      membership.planName = planName;
      membership.price = price;
      membership.startDate = startDate;
      membership.endDate = endDate;
      membership.isActive = true;
      await membership.save();
    } else {
      membership = await Membership.create({
        userId,
        planName,
        price,
        startDate,
        endDate,
        isActive: true
      });
    }

    res.status(200).json({ message: "Membership saved successfully", membership });
  } catch (error) {
    console.error("Create membership error:", error);
    res.status(500).json({ error: "Failed to save membership" });
  }
};


export const getMembershipStatus = async (req, res) => {
    try {
    const { userId } = req.params;
    const membership = await Membership.findOne({ userId });
    if (!membership) {
        res.status(200).json({
            status:'no_membership',
        });
        return;
    }

    const status = membership.checkStatus();
    await membership.save(); 

    res.status(200).json({
      status,
      planName: membership.planName,
      startDate: membership.startDate,
      endDate: membership.endDate,
      price: membership.price
    });
  } catch (error) {
    console.error("Get membership status error:", error);
    res.status(500).json({ error: "Failed to fetch membership status" });
  }
};

export const cancelMembership = async (req, res) => {
  try {
    const { userId } = req.params;
    const membership = await Membership.findOne({ userId });

    if (!membership) {
      return res.status(404).json({ message: "No membership found" });
    }

    membership.isActive = false;
    membership.endDate = new Date();
    await membership.save();

    res.status(200).json({ message: "Membership cancelled successfully" });
  } catch (error) {
    console.error("Cancel membership error:", error);
    res.status(500).json({ error: "Failed to cancel membership" });
  }
};
