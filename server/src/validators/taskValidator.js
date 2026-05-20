const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(3, 'Task description must be at least 3 characters'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['Todo', 'In Progress', 'Done']).default('Todo'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid due date'
  }),
  assignedTo: z.string().min(1, 'Please assign this task to a team member'),
  project: z.string().min(1, 'Please select a project for this task')
});

const updateTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').optional(),
  description: z.string().min(3, 'Task description must be at least 3 characters').optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']).optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid due date'
  }).optional(),
  assignedTo: z.string().optional(),
  project: z.string().optional()
});

const updateTaskStatusSchema = z.object({
  status: z.enum(['Todo', 'In Progress', 'Done'])
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema
};
