const logger = require('../logger');

/**
 * Represent a rollbackable Step.
 *
 * Steps are atomic, asynchronous actions that can be rolled back after it has been successfully executed.
 * If a Step fails during its execution, it will fail GRACEFULLY and should have no effects (i.e: no impurities)
 * on the running environments.
 *
 * NOTE: Steps are stateless, it do not remember whether it has been executed. Therefore, only
 * called `.rollback()` on steps that have been executed successfully. Steps will gracefully fail and leave
 * no effects.
 */
class Step {
  /**
   * Construct a new Step.
   * @param {object} arg
   * @param {string} arg.name - the name of the step.
   * @param {Promise} arg.execute - the Promise function that resolve when the step run successfully. If the function
   * failed, clean up gracefully before reject.
   * @param {Promise} arg.rollback - the Promise function that undo the execution step. Resolve when rollback successfully.
   */
  constructor({ name, execute, rollback }) {
    /** The name of this step */
    this.name = name;

    this.execute = async () => {
      logger.info(`- ${this.name}`);
      try {
        if (execute) await execute();
      } catch (error) {
        logger.error(`Executing ${this.name} failed due to:\n%s`, error);
        throw error;
      }
    };

    this.rollback = async () => {
      logger.info(`- ${this.name}`);
      try {
        if (rollback) await rollback();
      } catch (error) {
        logger.error(`Rolling back ${this.name} failed due to:\n%s`, error);
        throw error;
      }
    };
  }
}

module.exports = Step;
