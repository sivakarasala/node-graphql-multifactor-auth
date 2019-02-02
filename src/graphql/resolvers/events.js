const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../utilities/date");
const { user } = require("./nestedResolvers");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          date: dateToString(event._doc.date),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Authentication Error");
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        date: transformDate(result._doc.date)
      };
      const creator = await User.findById(req.userId);
      if (!creator) {
        throw new Error("User not found");
      }
      creator.createdEvents.push(event);
      await creator.save();

      return {
        ...createdEvent,
        creator: user.bind(this, createdEvent.creator)
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
