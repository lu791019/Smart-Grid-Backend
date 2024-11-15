'use strict';

/** @type {import('sequelize-cli').Migration} \*/
module.exports = {
  async up(queryInterface, Sequelize) {
    // 檢查是否已存在此表格
    const tableExists = await queryInterface.sequelize.query(`SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'alarm_config';`);

    if (tableExists[0].length === 0) {
      // 表格不存在，創建表格
      await queryInterface.createTable('alarm_config', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        device_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        device_config_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        warning: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        frequency: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
      });

      // 設置表格的擁有者
      await queryInterface.sequelize.query(
        `ALTER TABLE alarm_config OWNER TO "default";`,
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 檢查是否已存在此表格
    const tableExists = await queryInterface.sequelize.query(`SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'alarm_config';`);

    if (tableExists[0].length > 0) {
      // 表格存在，刪除表格
      await queryInterface.dropTable('alarm_config');
    }
  },
};
