'use strict';

/** @type {import('sequelize-cli').Migration} \*/
module.exports = {
  async up(queryInterface, Sequelize) {
    // 在這裡添加改變表結構的指令
    await queryInterface.addColumn('devices', 'group', {
      type: Sequelize.STRING,
      allowNull: true, // 如果允許這個欄位為空
      defaultValue: null, // 預設值為 null
    });
  },

  async down(queryInterface, Sequelize) {
    // 在這裡添加回滾表結構改變的指令
    await queryInterface.removeColumn('devices', 'group');
  },
};
