const DataTypes = require('sequelize');
const {Model} = DataTypes;

module.exports = class User extends Model{
    static init(sequelize) {
        return super.init({
            email: {
                type: DataTypes.STRING(30),
                allowNull: false, //필수
                unique: true, //고유한 값
            },
            nickname: {
                type: DataTypes.STRING(30),
                allowNull: false, //필수
            },
            password: {
                type: DataTypes.STRING(100),
                allowNull: false, //필수
            },
        },
        {
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8',
            collate: 'utf8_general_ci', //두개설정이 한글과 관련된 설정 
            sequelize,
        })
    }

    static associate(db){
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Comment);
        db.User.belongsToMany(db.Post, {through: 'Like', as: 'Liked'}); //사용자와 게시글 좋아요 관계 다:다
        db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'});
        db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followings', foreignKey : 'FollowerId'});
        //왜 저기 like는 폴인키 없음?
        //왜 유저와 유저관계는 폴인키 있음?
        //같은 테이블과 같은테이블의 매핑관계에서는 같은 userId로 같은 이름이므로
        //서로가 바라보는 참조값의 이름이 같아지니, foreignKey로 구분을함.
    }
};