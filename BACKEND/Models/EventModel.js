const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  eventId: {
    type: String,
    unique: true
  },
  eventName: { 
    type: String, 
    required: true 
  },
  eventType: { 
    type: String, 
    enum: ['Academic', 'Sport', 'Extra-Curricular'], 
    required: true 
  },
  grade: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdBy: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-generate Event ID
EventSchema.pre('save', async function (next) {
  if (!this.eventId) {
    try {
      const lastEvent = await this.constructor.findOne().sort({ eventId: -1 });
      let newEventId = 'EVT00001';

      if (lastEvent && lastEvent.eventId) {
        const lastIdNumber = parseInt(lastEvent.eventId.replace('EVT', ''), 10);
        newEventId = `EVT${String(lastIdNumber + 1).padStart(5, '0')}`;
      }

      this.eventId = newEventId;
      next();
    } catch (error) {
      console.error('Error generating Event ID:', error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', EventSchema, 'events');
