'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Step 1: Remove the original device_id column
      await queryInterface.removeColumn('devices_config', 'device_id', {
        transaction,
      });

      // Step 2: Add device_id column back with INTEGER type as part of the same transaction
      await queryInterface.addColumn(
        'devices_config',
        'device_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'devices', // Can directly reference the target table
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Step 1: Remove the device_id column (with INTEGER type) as part of the same transaction
      await queryInterface.removeColumn('devices_config', 'device_id', {
        transaction,
      });

      // Step 2: Add the device_id column back with its original (STRING) type
      await queryInterface.addColumn(
        'devices_config',
        'device_id',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction },
      );
    });
  },
};
