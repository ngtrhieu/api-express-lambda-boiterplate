/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
const logger = require('../logger');

/**
 * Represent a TaskRunner containing of rollbackable Tasks.
 *
 * When one of its Task failed, the failed Task and all **completed Tasks** will be rolled back
 * in reversed sequence.
 */
class TaskRunner {
  constructor(name, ...tasks) {
    /** The name of the task runner */
    this.name = name;

    /** The array of steps in this task */
    this.tasks = tasks;
  }

  /**
   * Execute this taskrunner.
   *
   * Returned a Promise that will resolve when all tasks completed successfully.
   *
   * If one of the task failed, auto rollback, then reject the Promise.
   */
  execute = async () => {
    if (!this.tasks || this.tasks.length === 0) {
      logger.info('Nothing to execute');
      return;
    }

    const stack = [];
    try {
      for (let i = 0; i < this.tasks.length; ++i) {
        const task = this.tasks[i];
        logger.info(`${stack.length + 1}/${this.tasks.length}: ${task.name}`);
        await task.execute();
        stack.push(task);
      }
    } catch (error) {
      logger.info(
        `Start rolling back all other ${stack.length} completed tasks...`,
      );
      await this._rollback(...stack);
      throw error;
    }

    logger.info(`Finished!`);
  };

  _rollback = async (...tasks) => {
    if (!tasks || tasks.length === 0) {
      logger.info('Nothing to rollback');
      return;
    }

    const reversed = tasks.reverse();
    let taskNo = reversed.length;
    const totalTasks = reversed.length;

    try {
      for (let i = 0; i < reversed.length; ++i) {
        const task = reversed[i];
        logger.info(`${taskNo}/${totalTasks}: ${task.name}`);
        taskNo -= 1;
        await task.rollback();
      }
    } catch (error) {
      logger.error(`Failed to rollback. Stopping...`);
      throw error;
    }

    logger.info(`Rolling back completed!`);
  };
}

module.exports = TaskRunner;
