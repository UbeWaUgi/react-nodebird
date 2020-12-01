const DataTypes = require('sequelize');
const {Model} = DataTypes;

module.exports = class Image extends Model{
    static init(sequelize) {
        return super.init({
            src: {
                type: DataTypes.STRING(200),
                allowNull: false,
            }
        },
        {
            charset: 'utf8',
            collate: 'utf8_general_ci', //한글과 이모티콘 관련된 설정
            modelName: 'Image',
            tableName: 'images',
            sequelize,
         }
        )
    }

    static associate(db) {
        db.Image.belongsTo(db.Post);
    }
};
