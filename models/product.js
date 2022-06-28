'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsTo(models.user, {
        foreignKey  : "idUser",
        as          : "user"
      })
    };
    
  }
  product.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    stock: DataTypes.INTEGER,
    image: DataTypes.TEXT,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};