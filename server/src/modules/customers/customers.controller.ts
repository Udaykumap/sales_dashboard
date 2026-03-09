import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import customerService from './customers.service';
import { CreateCustomerRequest, UpdateCustomerRequest, GetCustomersFilter, ApiResponse } from './customers.types';

class CustomerController {
  async create(req: AuthRequest, res: Response) {
    try {
      const body: CreateCustomerRequest = req.body;
      if (!body.name || !body.phone) {
        return res.status(400).json({ success: false, error: 'name and phone are required' } as ApiResponse<null>);
      }
      const customer = await customerService.createCustomer(body);
      res.status(201).json({ success: true, data: customer, message: 'Customer created' } as ApiResponse<any>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message } as ApiResponse<null>);
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const filters: GetCustomersFilter = {
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc'
      };
      const result = await customerService.listCustomers(filters);
      res.json({ success: true, data: result.customers, total: result.total } as any);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await customerService.getCustomerById(id);
      res.json({ success: true, data: customer } as ApiResponse<any>);
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message } as ApiResponse<null>);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const body: UpdateCustomerRequest = req.body;
      const customer = await customerService.updateCustomer(id, body);
      res.json({ success: true, data: customer, message: 'Customer updated' } as ApiResponse<any>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message } as ApiResponse<null>);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await customerService.deleteCustomer(id);
      res.json({ success: true, message: 'Customer deleted' } as ApiResponse<null>);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message } as ApiResponse<null>);
    }
  }
}

export default new CustomerController();
