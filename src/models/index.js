const { User, ROLES } = require('./User');
const { Category } = require('./Category');
const { Complaint, PRIORITIES, STATUSES } = require('./Complaint');
const { Comment } = require('./Comment');
const { Notification, NOTIFICATION_TYPES } = require('./Notification');

// Tüm modelleri ve sabitlerini dışa aktar
module.exports = {
  User,
  ROLES,
  Category,
  Complaint,
  PRIORITIES,
  STATUSES,
  Comment,
  Notification,
  NOTIFICATION_TYPES
}; 