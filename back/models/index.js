const Sequelize = require('sequelize');
const comment= require('./comment');
const hashtag= require('./hashtag');
const image= require('./image');
const post= require('./post');
const user= require('./user');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
//config의 config 즉 디비 설정 파일중 기본값 development를 가지고온다.

const db={};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Comment = comment;
db.Post = post;
db.User = user;
db.Hashtag = hashtag;
db.Image = image;

//최신문법들
Object.keys(db).forEach(modelName => {
  db[modelName].init(sequelize);
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); //각 모델 associate 관계 설정
  }
});

/*
db.Comment = require('./comment')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
*/



db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log(db);

module.exports = db;
