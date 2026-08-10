// Pre-made mock dataset templates for rapid dashboard generation

export interface PresetDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  csv: string;
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: 'saas_revenue',
    name: 'SaaS MRR & Marketing Growth',
    description: '12 months of SaaS performance metrics: MRR, Churn Rate, Marketing Spend, and Acquisition Costs.',
    category: 'SaaS & Billing',
    csv: `Date,MRR,Churn_Rate,Ad_Spend,New_Signups,CAC,Customer_LTV,Category
2026-01-01,15200,2.1,1200,145,55,1200,Enterprise
2026-02-01,18500,1.9,1500,188,48,1250,Growth
2026-03-01,22100,2.4,2000,210,62,1180,Growth
2026-04-01,24800,2.2,1800,240,50,1300,Starter
2026-05-01,29100,1.8,2500,295,45,1350,Enterprise
2026-06-01,34500,1.5,3000,350,42,1420,Growth
2026-07-01,39800,1.9,3500,410,48,1400,Enterprise
2026-08-01,44200,2.0,3200,442,52,1380,Starter
2026-09-01,49500,1.7,4000,512,46,1450,Growth
2026-10-01,55100,1.4,4500,580,41,1500,Enterprise
2026-11-01,62300,1.2,5000,660,38,1550,Growth
2026-12-01,71200,1.1,5500,745,35,1600,Enterprise`
  },
  {
    id: 'ecommerce_sales',
    name: 'E-commerce Orders & Logistics',
    description: 'E-commerce transactional records including sales totals, product category, shipping costs, and refund rates.',
    category: 'Retail & E-commerce',
    csv: `Month,Revenue,Orders,Average_Order_Value,Shipping_Cost,Refunds,Conversion_Rate,Category
January,45200,940,48,1200,18,2.4,Electronics
February,48900,1020,47,1350,22,2.6,Apparel
March,52100,1110,46,1500,25,2.5,Home & Kitchen
April,58600,1250,46,1700,14,2.9,Electronics
May,64200,1340,47,1900,30,3.1,Apparel
June,71800,1480,48,2100,35,3.2,Home & Kitchen
July,78500,1620,48,2250,28,3.3,Electronics
August,74200,1540,48,2150,40,3.0,Apparel
September,82100,1710,48,2400,20,3.4,Home & Kitchen
October,89500,1850,48,2600,15,3.5,Electronics
November,104300,2120,49,3100,12,3.9,Apparel
December,124800,2540,49,3800,45,4.2,Home & Kitchen`
  },
  {
    id: 'digital_marketing',
    name: 'Marketing Campaigns ROI',
    description: 'Ad campaign telemetry detailing budget allocation, click-through rates (CTR), leads, and cost-per-lead.',
    category: 'Advertising & Marketing',
    csv: `Campaign_Name,Budget,Clicks,Impressions,CTR,Leads,CPL,Platform
Google Search Pro,15000,32000,640000,5.0,960,15.6,Search
Meta Retargeting,12000,28000,850000,3.3,840,14.3,Social
LinkedIn Outbound,8000,4200,120000,3.5,160,50.0,Professional
YouTube Brand,10000,18000,1200000,1.5,120,83.3,Video
TikTok Viral,6000,45000,1800000,2.5,450,13.3,Social
Newsletter Sponsorship,4000,6000,80000,7.5,240,16.7,Email
Twitter Promo,3000,5200,250000,2.1,80,37.5,Social
Affiliate Partnership,5000,12000,180000,6.7,360,13.9,Partner`
  },
  {
    id: 'hr_employee_analytics',
    name: 'Corporate HR Performance',
    description: 'Organization personnel indicators tracking average department salaries, satisfaction, performance index, and tenures.',
    category: 'Operations & HR',
    csv: `Department,Staff_Count,Avg_Salary,Satisfaction,Performance_Index,Tenure_Years,Attrition_Rate,Region
Engineering,48,112000,4.2,84,3.2,4.5,North America
Product,12,105000,4.1,86,2.8,2.1,North America
Sales,35,82000,3.8,78,1.9,12.4,Europe
Marketing,18,78000,3.9,81,2.4,6.2,Europe
Customer Success,22,64000,4.3,83,2.1,8.5,Asia Pacific
Design,8,95000,4.4,85,4.1,3.0,Europe
Operations,15,75000,4.0,79,3.5,5.1,Asia Pacific
HR,6,72000,4.5,82,4.8,1.2,North America`
  }
];
