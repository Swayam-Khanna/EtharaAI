const { z } = require('zod');

const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(5, 'Project description must be at least 5 characters'),
  status: z.enum(['active', 'completed', 'on_hold']).optional(),
  members: z.array(z.string()).optional()
});

const updateProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').optional(),
  description: z.string().min(5, 'Project description must be at least 5 characters').optional(),
  status: z.enum(['active', 'completed', 'on_hold']).optional(),
  members: z.array(z.string()).optional()
});

const addMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address of the team member')
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
};
