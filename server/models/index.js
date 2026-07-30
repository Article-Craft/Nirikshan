const User = require('./User');
const PromiseModel = require('./Promise');
const Evidence = require('./Evidence');
const StatusHistory = require('./StatusHistory');

// Associations
User.hasMany(PromiseModel, { foreignKey: 'created_by', as: 'promises' });
PromiseModel.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

PromiseModel.hasMany(Evidence, { foreignKey: 'promise_id', as: 'evidences' });
Evidence.belongsTo(PromiseModel, { foreignKey: 'promise_id', as: 'promise' });

User.hasMany(Evidence, { foreignKey: 'uploaded_by', as: 'uploads' });
Evidence.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

PromiseModel.hasMany(StatusHistory, { foreignKey: 'promise_id', as: 'history' });
StatusHistory.belongsTo(PromiseModel, { foreignKey: 'promise_id', as: 'promise' });

User.hasMany(StatusHistory, { foreignKey: 'changed_by', as: 'changes' });
StatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changer' });

StatusHistory.belongsTo(Evidence, { foreignKey: 'evidence_id', as: 'evidence' });

module.exports = {
  User,
  Promise: PromiseModel,
  Evidence,
  StatusHistory
};
