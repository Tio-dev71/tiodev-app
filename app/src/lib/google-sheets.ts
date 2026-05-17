// ============================================
// Google Sheets API Integration
// Appends order and affiliate data to configured Google Sheets tabs
// ============================================

import { google } from 'googleapis';

/**
 * Get authenticated Google Sheets client
 * Uses service account credentials from environment variables
 */
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

/**
 * Append an order row to the configured Google Sheet
 * Columns: Order ID | Customer Name | Email | Phone | Products | Price | Discount | Total | Affiliate Code | Payment Method | Status | Timestamp
 */
export async function appendOrderToSheet(orderData: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: string;
  subtotal: number;
  discount: number;
  total: number;
  affiliateCode: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}) {
  try {
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      console.warn('⚠️ Google Sheets not configured. Skipping sync.');
      return null;
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> extends Promise<infer T> ? T : never });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Orders!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            orderData.orderId,
            orderData.orderNumber,
            orderData.customerName,
            orderData.customerEmail,
            orderData.customerPhone,
            orderData.products,
            orderData.subtotal,
            orderData.discount,
            orderData.total,
            orderData.affiliateCode || 'N/A',
            orderData.paymentMethod,
            orderData.status,
            orderData.createdAt,
          ],
        ],
      },
    });

    console.log(`✅ Order synced to Google Sheets: ${response.data.updates?.updatedCells} cells`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync order to Google Sheets:', error);
    return null;
  }
}

/**
 * Initialize the sheet headers if the sheet is empty
 */
export async function initializeSheetHeaders() {
  try {
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      return null;
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> extends Promise<infer T> ? T : never });

    // Check if headers already exist
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Orders!A1:M1',
    });

    if (existing.data.values && existing.data.values.length > 0) {
      return; // Headers already exist
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Orders!A1:M1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            'Order ID',
            'Order Number',
            'Customer Name',
            'Email',
            'Phone',
            'Products',
            'Subtotal',
            'Discount',
            'Total',
            'Affiliate Code',
            'Payment Method',
            'Status',
            'Timestamp',
          ],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Failed to initialize sheet headers:', error);
  }
}

/**
 * Append an affiliate row to the configured Google Sheet
 * Columns: Code | Name | Email | Discount % | Commission % | Active | Orders | Revenue | Created At
 */
export async function appendAffiliateToSheet(affiliateData: {
  code: string;
  name: string;
  email: string;
  discountPercent: number;
  commissionRate: number;
  active: boolean;
  orderCount: number;
  totalRevenue: number;
  createdAt: string;
}) {
  try {
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      console.warn('⚠️ Google Sheets not configured. Skipping affiliate sync.');
      return null;
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> extends Promise<infer T> ? T : never });

    const affiliateSheetName = process.env.GOOGLE_SHEETS_AFFILIATE_SHEET || 'Trang tính1';

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${affiliateSheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            affiliateData.code,
            affiliateData.name,
            affiliateData.email,
            affiliateData.discountPercent,
            affiliateData.commissionRate,
            affiliateData.active ? 'ACTIVE' : 'INACTIVE',
            affiliateData.orderCount,
            affiliateData.totalRevenue,
            affiliateData.createdAt,
          ],
        ],
      },
    });

    console.log(`✅ Affiliate synced to Google Sheets: ${response.data.updates?.updatedCells} cells`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync affiliate to Google Sheets:', error);
    return null;
  }
}

/**
 * Initialize the affiliates sheet headers if the sheet is empty
 */
export async function initializeAffiliateSheetHeaders() {
  try {
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      return null;
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> extends Promise<infer T> ? T : never });

    const affiliateSheetName = process.env.GOOGLE_SHEETS_AFFILIATE_SHEET || 'Trang tính1';

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${affiliateSheetName}!A1:I1`,
    });

    if (existing.data.values && existing.data.values.length > 0) {
      return;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${affiliateSheetName}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Code',
          'Name',
          'Email',
          'Discount %',
          'Commission %',
          'Status',
          'Orders',
          'Revenue',
          'Created At',
        ]],
      },
    });
  } catch (error) {
    console.error('❌ Failed to initialize affiliate sheet headers:', error);
  }
}
