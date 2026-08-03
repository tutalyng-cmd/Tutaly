const { DataSource } = require('typeorm');
const { CommunityUpvote } = require('./dist/modules/community/entities/community-upvote.entity');
const { CommunityThread } = require('./dist/modules/community/entities/community-thread.entity');
const { User } = require('./dist/modules/user/entities/user.entity');
const { SeekerProfile } = require('./dist/modules/user/entities/seeker-profile.entity');
const { EmployerProfile } = require('./dist/modules/user/entities/employer-profile.entity');
// this is getting too complicated to init TypeORM manually outside Nest.
