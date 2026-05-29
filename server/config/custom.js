/**
 * Custom configuration
 * (sails.config.custom)
 */

module.exports.custom = {
  jwtSecret:
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    'dev-jwt-secret-change-me',
  sessionDurationHours: Number(process.env.SESSION_DURATION_HOURS || 168),
  defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE || 25)
};
