/**
 * Base Factory Class
 *
 * Provides core factory functionalities inspired by modern ORM factories:
 * - .definition(): Defines default attribute blueprint
 * - .make(countOrOverrides, overrides): Builds in-memory instance(s)
 * - .create(countOrOverrides, overrides): Persists instance(s) to PostgreSQL
 * - .state(overrides): Returns a new factory instance with predefined state overrides
 * - Sequence and random generator utility methods
 */

class BaseFactory {
  constructor() {
    this.stateOverrides = {};
    this.sequenceIndex = 1;
  }

  /**
   * Must be overridden by subclasses to provide default field values
   * @returns {Object}
   */
  definition() {
    throw new Error('definition() must be implemented by subclass');
  }

  /**
   * Must be overridden by subclasses to insert a single record into PostgreSQL
   * @param {Object} record
   * @returns {Promise<Object>}
   */
  async insert(record) {
    throw new Error('insert() must be implemented by subclass');
  }

  /**
   * Clone factory with state overrides
   * @param {Object} overrides
   * @returns {BaseFactory}
   */
  state(overrides = {}) {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    clone.stateOverrides = { ...this.stateOverrides, ...overrides };
    return clone;
  }

  /**
   * Build one or many records in memory without saving to DB
   * @param {number|Object} countOrOverrides
   * @param {Object} [overrides]
   * @returns {Object|Array<Object>}
   */
  make(countOrOverrides = 1, overrides = {}) {
    if (typeof countOrOverrides === 'number') {
      const results = [];
      for (let i = 0; i < countOrOverrides; i++) {
        results.push(this.buildOne(overrides));
      }
      return results;
    }
    return this.buildOne(countOrOverrides || {});
  }

  /**
   * Build and persist one or many records into PostgreSQL database
   * @param {number|Object} countOrOverrides
   * @param {Object} [overrides]
   * @returns {Promise<Object|Array<Object>>}
   */
  async create(countOrOverrides = 1, overrides = {}) {
    if (typeof countOrOverrides === 'number') {
      const records = this.make(countOrOverrides, overrides);
      const inserted = [];
      for (const record of records) {
        const res = await this.insert(record);
        inserted.push(res || record);
      }
      return inserted;
    }

    const record = this.make(1, countOrOverrides || {});
    const res = await this.insert(record);
    return res || record;
  }

  /**
   * Internal method to build a single record with sequence and state merges
   * @param {Object} customOverrides
   * @returns {Object}
   */
  buildOne(customOverrides = {}) {
    const currentSeq = this.sequenceIndex++;
    const defaultData = this.definition(currentSeq);
    return {
      ...defaultData,
      ...this.stateOverrides,
      ...customOverrides
    };
  }

  // --- Static Helper Utilities for Data Generation ---

  static randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomItems(array, min = 1, max = array.length) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomBoolean(probability = 0.5) {
    return Math.random() < probability;
  }

  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '.')
      .replace(/^-+|-+$/g, '');
  }

  static randomDate(startDaysAgo = 30, endDaysAgo = 0) {
    const now = Date.now();
    const past = now - (startDaysAgo * 86400000);
    const end = now - (endDaysAgo * 86400000);
    const target = new Date(past + Math.random() * (end - past));
    return target.toISOString();
  }
}

module.exports = BaseFactory;
