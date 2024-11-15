'use strict';

/** @type {import('sequelize-cli').Migration} \*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('devices_config', 'frequency', {
      type: Sequelize.INTEGER, // 假如 frequency 是整數，根據你的需求調整
      allowNull: true, // 根據你的需求調整
      defaultValue: 60, // 如果有默認值可以設置，根據需求調整
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('devices_config', 'frequency');
  },
};
