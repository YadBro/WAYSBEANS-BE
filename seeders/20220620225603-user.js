'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('users', [{
      fullname      : 'Yadi Apriyadi',
      email     : 'admin@gmail.com',
      password  : '$2b$10$S4fWdHObqFDWcIij0sDqAeT7leRS5zWZxejTTqvI7XUVhfvn35rqG', // 123456
      status    : 'seller',
      createdAt : '2022-06-21',
      updatedAt : '2022-06-21'
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
