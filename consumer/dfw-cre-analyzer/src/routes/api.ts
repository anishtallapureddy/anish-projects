import { Router, Request, Response } from 'express';
import { findProperties, findPropertyById, getMarketSummary, getPropertiesGeoJson, getQuotaStats } from '../db/queries';
import { PropertyFilters } from '../types';

const router = Router();

// Parse filter query params
function parseFilters(query: any): PropertyFilters {
  return {
    zipCodes: query.zipCode ? (Array.isArray(query.zipCode) ? query.zipCode : [query.zipCode]) : undefined,
    propertyTypes: query.propertyType ? (Array.isArray(query.propertyType) ? query.propertyType : [query.propertyType]) : undefined,
    investmentFlags: query.investmentFlag ? (Array.isArray(query.investmentFlag) ? query.investmentFlag : [query.investmentFlag]) : undefined,
    priceMin: query.priceMin ? Number(query.priceMin) : undefined,
    priceMax: query.priceMax ? Number(query.priceMax) : undefined,
    sqftMin: query.sqftMin ? Number(query.sqftMin) : undefined,
    underpricingMin: query.underpricingMin ? Number(query.underpricingMin) : undefined,
    daysOnMarketMax: query.daysOnMarketMax ? Number(query.daysOnMarketMax) : undefined,
    sortBy: query.sortBy || 'score',
    sortOrder: query.sortOrder || 'desc',
    page: query.page ? Number(query.page) : 1,
    pageSize: query.pageSize ? Number(query.pageSize) : 25,
  };
}

// GET /api/v1/properties
router.get('/properties', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const result = findProperties(filters);
  res.json(result);
});

// GET /api/v1/properties/map
router.get('/properties/map', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const geojson = getPropertiesGeoJson(filters);
  res.json(geojson);
});

// GET /api/v1/properties/export
router.get('/properties/export', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  filters.pageSize = 1000;
  const result = findProperties(filters);

  const headers = ['Address','City','ZIP','Type','Price','Sqft','$/Sqft','Zestimate','Score','Flag','Days on Market','Walk Score'];
  const rows = result.data.map(p => [
    p.address, p.city, p.zipCode, p.propertyType,
    p.listingPrice, p.sqft || '', p.pricePerSqft || '',
    p.zestimateValue || '', p.underpricingScore || '',
    p.investmentFlag || '', p.daysOnMarket || '', p.walkScore || '',
  ].join(','));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=dfw-cre-export.csv');
  res.send([headers.join(','), ...rows].join('\n'));
});

// GET /api/v1/properties/:id
router.get('/properties/:id', (req: Request, res: Response) => {
  const property = findPropertyById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  res.json(property);
});

// GET /api/v1/market/summary
router.get('/market/summary', (_req: Request, res: Response) => {
  res.json(getMarketSummary());
});

// GET /api/v1/admin/quota
router.get('/admin/quota', (_req: Request, res: Response) => {
  res.json(getQuotaStats());
});

// GET /health
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
