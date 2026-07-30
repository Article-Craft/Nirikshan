const User = require('./User');
const PromiseModel = require('./Promise');
const Evidence = require('./Evidence');
const StatusHistory = require('./StatusHistory');
const District = require('./District');
const Constituency = require('./Constituency');
const Representative = require('./Representative');
const Rating = require('./Rating');
const BudgetProject = require('./BudgetProject');
const Complaint = require('./Complaint');
const RtiRequest = require('./RtiRequest');
const CivicEvent = require('./CivicEvent');

// Existing Associations
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

// New Associations
// District & Constituency (1:N)
District.hasMany(Constituency, { foreignKey: 'district_id', as: 'constituencies' });
Constituency.belongsTo(District, { foreignKey: 'district_id', as: 'district' });

// Constituency & Representative (1:N)
Constituency.hasMany(Representative, { foreignKey: 'constituency_id', as: 'representatives' });
Representative.belongsTo(Constituency, { foreignKey: 'constituency_id', as: 'constituency' });

// Constituency & Winner Representative (1:1 / belongsTo)
Constituency.belongsTo(Representative, { foreignKey: 'winner_representative_id', as: 'winnerRepresentative' });

// Representative & Rating (1:N)
Representative.hasMany(Rating, { foreignKey: 'representative_id', as: 'ratings' });
Rating.belongsTo(Representative, { foreignKey: 'representative_id', as: 'representative' });

// User & Rating (1:N)
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// District & BudgetProject (1:N)
District.hasMany(BudgetProject, { foreignKey: 'district_id', as: 'budgetProjects' });
BudgetProject.belongsTo(District, { foreignKey: 'district_id', as: 'district' });

// User & RtiRequest (1:N)
User.hasMany(RtiRequest, { foreignKey: 'user_id', as: 'rtiRequests' });
RtiRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Promise: PromiseModel,
  Evidence,
  StatusHistory,
  District,
  Constituency,
  Representative,
  Rating,
  BudgetProject,
  Complaint,
  RtiRequest,
  CivicEvent
};
