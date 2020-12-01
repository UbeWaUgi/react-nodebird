const DataTypes = require('sequelize');
const {Model} = DataTypes;

module.exports = class Post extends Model {
    static init(sequelize) {
        return super.init({
            content: {
                type: DataTypes.TEXT,
                allowNull : false,
            },
        },
        {
            modelName: 'Post',
            tableName: 'posts',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            sequelize,
        }
        )
    }

    static associate(db) {
        db.Post.belongsTo(db.User); //post.addUser, remove, get, set
        db.Post.hasMany(db.Comment); //post.addComments, remove, get, set
        db.Post.hasMany(db.Image); //post.addImages, remove ..., get, set
        db.Post.belongsTo(db.Post, {as: 'Retweet'}); //리트윗
        db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}); //post.addHashtags remove 등등
        db.Post.belongsToMany(db.User, {through: 'Like', as:'Likers'}); //post.addLikers, post.removeLikers
        //사용자와 게시글 좋아요 관계 다:다 중간테이블은
        //Like라는 이름임
    }
};