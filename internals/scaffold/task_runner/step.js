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
   * @param {string} the name of the step.
   * @param {Promise} execute - the Promise function that resolve when the step run successfully. If the function
   * failed, clean up gracefully before reject.
   * @param {Promise} rollback - the Promise function that undo the execution step. Resolve when rollback successfully.
   */
  constructor(name, execute, rollback) {
    /** The name of this step */
    this.name = name;

    this.execute = execute;
    this.rollback = rollback;
  }
}

module.exports = Step;
