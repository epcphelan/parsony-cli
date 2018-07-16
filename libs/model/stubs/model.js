/**
 * MODEL_NAME model
 *
 * Sequelize Model Documentation
 * http://docs.sequelizejs.com/manual/tutorial/models-definition.html
 *
 * Associations:
 * http://docs.sequelizejs.com/manual/tutorial/associations.html
 *
 * @param {object} sequelize - instance of sequelize
 * @param {object} DataTypes - sequelize DataTypes enum
 * @return {*}
 */
module.exports = (sequelize, DataTypes) => {
  let MODEL_NAME = sequelize.define("MODEL_NAME", {
    // flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }
  });
  MODEL_NAME.associate = (models) => {
    // MODEL_NAME.belongsTo(models.AnotherModel)
  };
  return MODEL_NAME;
};
