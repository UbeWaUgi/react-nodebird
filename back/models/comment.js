const DataTypes = require('sequelize');
const {Model} = DataTypes;

//현재이게 최신문법이다.
module.exports = class Comment extends Model{
    static init(sequelize) {
        //Comment의 init이아니라 Model의 Init을 호출해야 테이블이 생성됨.
        return super.init({
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                
            },
            
        },
        {
            modelName: 'Comment',
            tableName: 'comments',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci', //한글과 이모티콘 관련된 설정
            sequelize, //연결 객체 index의 sequelize를 말함.
         }
        );
    }

    static associate(db) {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
    }
}; 
/*
module.exports= (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', { 
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            
        },

    }, {
       charset: 'utf8mb4',
       collate: 'utf8mb4_general_ci', //한글과 이모티콘 관련된 설정
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
        //belongsTo는 역활이 있음.
        //userid, postid라는 컬럼을 만들어줌.
    };
    
    return Comment;
}
*/