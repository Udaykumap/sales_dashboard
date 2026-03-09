import { Request, Response } from 'express'
import * as reportService from './reports.service'

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const report = await reportService.getSalesReportService()
    res.json(report)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales report' })
  }
}

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const report = await reportService.getInventoryReportService()
    res.json(report)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory report' })
  }
}