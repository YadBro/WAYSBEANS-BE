'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone: {
        type: Sequelize.INTEGER
      },
      gender: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.TEXT
      },
      postcode: {
        type: Sequelize.INTEGER
      },
      idUser: {
        type: Sequelize.INTEGER,
        references  : {
          model : "users",
          key   : "id"
        },
        onUpdate    : "CASCADE",
        onDelete    : "CASCADE"
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
    await queryInterface.dropTable('profiles');
  }
};