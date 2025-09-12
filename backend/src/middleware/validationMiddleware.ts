import { body, param, query } from 'express-validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const sanitizeHtml = (html: string): string => {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

export const validateComplaint = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('complaint')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Complaint must be between 10 and 10000 characters')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

export const validateComment = [
  body('comment_text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Comment must be between 1 and 5000 characters'),
  body('is_internal')
    .optional()
    .isBoolean()
    .withMessage('is_internal must be a boolean')
];

export const validateComplaintId = [
  param('id')
    .isUUID()
    .withMessage('Invalid complaint ID format')
];

export const validateStatus = [
  body('status')
    .isIn(['Pending', 'Resolved'])
    .withMessage('Status must be either Pending or Resolved')
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['Pending', 'Resolved'])
    .withMessage('Status must be either Pending or Resolved')
];