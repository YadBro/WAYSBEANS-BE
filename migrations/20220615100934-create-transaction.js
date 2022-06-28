'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idProduct: {
        type: Sequelize.INTEGER,
        references  : {
          model : "products",
          id    : "id"
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      idBuyer: {
        type: Sequelize.INTEGER,
        references: {
          model : {
            tableName : 'users'
          },
          key : 'id'
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      idSeller: {
        type: Sequelize.INTEGER,
        references: {
          model : {
            tableName : 'users'
          },
          key : 'id'
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      price: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};