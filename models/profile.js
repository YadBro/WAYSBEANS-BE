'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      profile.belongsTo(models.user, {
        foreignKey  : "idUser",
        as          : "user"
      });
    }
  }
  profile.init({
    phone: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    address: DataTypes.TEXT,
    image: DataTypes.TEXT,
    postcode: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'profile',
  });
  return profile;
};