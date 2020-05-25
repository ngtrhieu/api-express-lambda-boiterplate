/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
const logger = require('../logger');

/**
 * Represent a Task containing of rollbackable Steps that will be run when the Task run.
 *
 * When the task failed *(one of its steps failed)*, all **completed steps** will be rolled back
 * in reversed sequence. The failed step WILL NOT be rolled back.
 *
 * NOTE: Tasks are stateless, it do not remember whether it has been executed. Therefore, only
 * called `.rollback()` on tasks that have been executed successfully. Failed execution will
 * be automatically rolled back.
 *
 */
class Task {
  constructor(name, ...steps) {
    /** The name of the task */
    this.name = name;

    /** The array of steps in this task */
    this.steps = steps;
  }

  /**
   * Execute this task.
   *
   * Returned a Promise that will resolve when all steps completed successfully.
   *
   * If one of the step failed, auto rollback, then reject the Promise.
   */
  execute = async () => {
    if (!this.steps || this.steps.length === 0) {
      return;
    }

    const stack = [];
    try {
      for (let i = 0; i < this.steps.length; ++i) {
        const step = this.steps[i];
        await step.execute();
        stack.push(step);
      }
    } catch (error) {
      await this._rollback(...stack);
      throw error;
    }
  };

  /**
   * Rollback all steps in this task.
   *
   * Returned a Promise that will resolve when all tasks rolled back successfully.
   *
   * NOTE: Only called this when after the previous execute() **HAVE BEEN RESOLVED SUCCESFULLY**,
   * otherwise you might run rollback codes on steps that might not actually happened.
   */
  rollback = async () => {
    await this._rollback(...this.steps);
  };

  _rollback = async (...steps) => {
    if (!steps || steps.length === 0) {
      return;
    }

    logger.info(`Start rolling back "${this.name}"...`);

    const reversed = steps.reverse();
    for (let i = 0; i < reversed.length; ++i) {
      const step = reversed[i];
      await step.rollback();
    }
  };
}

module.exports = Task;
