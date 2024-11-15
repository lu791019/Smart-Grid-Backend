'use strict';

/** @type {import('sequelize-cli').Migration} \*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events_log', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      severity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('events_log');
  },
};
