'use strict';

/** @type {import('sequelize-cli').Migration} \*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('devices_config', 'scale', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.changeColumn('devices_config', 'unit', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('devices_config', 'scale', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.changeColumn('devices_config', 'unit', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
