// ============================================
// VietQR Code Generator
// Generates QR codes following Vietnam QR standard
// Uses VietQR API for bank transfer QR codes
// ============================================

import QRCode from 'qrcode';

interface VietQRParams {
  amount: number;
  description: string;
  orderNumber: string;
}

/**
 * Generate VietQR data URL for bank transfer
 * Uses the VietQR open API to generate standardized QR codes
 */
export async function generateVietQR(params: VietQRParams) {
  const bankId = process.env.VIETQR_BANK_ID || '970422';
  const accountNo = process.env.VIETQR_ACCOUNT_NO || '';
  const accountName = process.env.VIETQR_ACCOUNT_NAME || '';
  const template = process.env.VIETQR_TEMPLATE || 'compact2';

  // Build VietQR API URL (free tier, no API key needed)
  const vietqrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${params.amount}&addInfo=${encodeURIComponent(params.description)}&accountName=${encodeURIComponent(accountName)}`;

  // Also generate a fallback QR code locally using EMVCo standard
  const qrContent = buildEMVCoQRString({
    bankId,
    accountNo,
    amount: params.amount,
    description: params.description,
  });

  const localQRDataURL = await QRCode.toDataURL(qrContent, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // Map bank IDs to bank names
  const bankNames: Record<string, string> = {
    '970422': 'MB Bank',
    '970415': 'VietinBank',
    '970436': 'Vietcombank',
    '970418': 'BIDV',
    '970407': 'Techcombank',
    '970423': 'TPBank',
    '970432': 'VP Bank',
    '970416': 'ACB',
    '970405': 'Agribank',
    '970448': 'OCB',
    '970403': 'Sacombank',
    '970441': 'VIB',
    '970443': 'SHB',
  };

  return {
    qrImageUrl: vietqrUrl,
    qrDataURL: localQRDataURL,
    bankName: bankNames[bankId] || `Bank ${bankId}`,
    accountNo,
    accountName,
    amount: params.amount,
    description: params.description,
    orderNumber: params.orderNumber,
  };
}

/**
 * Build EMVCo QR string for VietQR standard
 * This follows the EMVCo specification used by NAPAS/VietQR
 */
function buildEMVCoQRString(params: {
  bankId: string;
  accountNo: string;
  amount: number;
  description: string;
}): string {
  // Simplified EMVCo QR payload
  // In production, this should follow the full NAPAS specification
  const payload = [
    `00020101`, // Payload Format Indicator
    `010212`, // Point of Initiation (Dynamic)
    `38${padLength(buildMerchantInfo(params.bankId, params.accountNo))}${buildMerchantInfo(params.bankId, params.accountNo)}`,
    `5303704`, // Transaction Currency (VND = 704)
    `54${padLength(params.amount.toString())}${params.amount}`,
    `5802VN`, // Country Code
    `62${padLength(buildAdditionalData(params.description))}${buildAdditionalData(params.description)}`,
  ].join('');

  // Calculate CRC
  const crcPayload = payload + '6304';
  const crc = calculateCRC16(crcPayload);

  return crcPayload + crc;
}

function buildMerchantInfo(bankId: string, accountNo: string): string {
  const guid = `0010A000000727`;
  const bankBin = `0106${bankId}`;
  const acctNo = `02${padLength(accountNo)}${accountNo}`;
  return `${guid}01${padLength(bankBin + acctNo)}${bankBin}${acctNo}`;
}

function buildAdditionalData(description: string): string {
  const desc = description.substring(0, 25); // Max 25 chars
  return `08${padLength(desc)}${desc}`;
}

function padLength(str: string): string {
  return str.length.toString().padStart(2, '0');
}

function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
