const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../utilities/date");

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      password: null,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        creator: user.bind(this, event.creator),
        date: dateToString(event.date)
      };
    });
  } catch (err) {
    throw err;
  }
};

exports.user = user;
//exports.events = events;
