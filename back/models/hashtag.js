const DataTypes = require('sequelize');
const {Model} = DataTypes;

module.exports = class Hashtag extends Model {
    static init (sequelize) {
        return super.init({
            name: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci', //한글과 이모티콘 관련된 설정
            modelName: 'Hashtag',
            tableName: 'hashtags',
            sequelize,
         }
        )
    }

    static associate(db) {
        db.Hashtag.belongsToMany(db.Post ,{through: 'PostHashtag'});
    }
};