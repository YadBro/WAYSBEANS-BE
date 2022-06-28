'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasOne(models.profile, {
        foreignKey  : "idUser",
        as          : "profile"
      });

      user.hasMany(models.product, {
        foreignKey  : "idUser",
        as          : "products"
      });

      user.hasMany(models.chat, {
        as: "senderMessage",
        foreignKey: {
          name: "idSender",
        },
      });

      user.hasMany(models.chat, {
        as: "recipientMessage",
        foreignKey: {
          name: "idRecipient",
        },
      });
      
    }
  }
  user.init({
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};