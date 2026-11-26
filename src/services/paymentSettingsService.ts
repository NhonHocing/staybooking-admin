import { pb } from '../lib/pocketbase';
import type { PaymentSettingsRecord } from '../types/models';

export interface VietQrBankOption {
  code: string;
  name: string;
}

export const VIETQR_BANKS: VietQrBankOption[] = [
  { code: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương VN)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương VN)' },
  { code: 'ICB', name: 'VietinBank (Công Thương VN)' },
  { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển VN)' },
  { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { code: 'VIB', name: 'VIB (Quốc Tế)' },
  { code: 'HDB', name: 'HDBank (Phát Triển TP.HCM)' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
  { code: 'MSB', name: 'MSB (Hàng Hải)' },
  { code: 'SHB', name: 'SHB (Sài Gòn – Hà Nội)' },
  { code: 'VBA', name: 'Agribank (Nông Nghiệp & PTNT)' },
  { code: 'LPB', name: 'LPBank (Lộc Phát VN)' },
  { code: 'EIB', name: 'Eximbank (Xuất Nhập Khẩu)' },
  { code: 'SEAB', name: 'SeABank (Đông Nam Á)' },
];

export type PaymentSettingsPayload = Omit<PaymentSettingsRecord, 'id' | 'updated'>;

export const DEFAULT_VIETQR_CONFIG: PaymentSettingsPayload = {
  key: 'vietqr',
  bankCode: 'MB',
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNumber: '0987654321',
  accountName: 'CONG TY STAYBOOKING VN',
  template: 'compact2',
};

export function buildVietQrPreviewUrl(
  config: Pick<
    PaymentSettingsPayload,
    'bankCode' | 'accountNumber' | 'accountName' | 'template'
  >,
  amount = 1000000,
  addInfo = 'TT SB-DEMO01',
): string {
  const bank = encodeURIComponent(config.bankCode.trim() || 'MB');
  const acc = encodeURIComponent(config.accountNumber.trim() || '0987654321');
  const tpl = encodeURIComponent(config.template.trim() || 'compact2');
  const info = encodeURIComponent(addInfo);
  const name = encodeURIComponent(config.accountName.trim() || 'STAYBOOKING');
  return `https://img.vietqr.io/image/${bank}-${acc}-${tpl}.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}

export const paymentSettingsService = {
  async getVietQr(): Promise<PaymentSettingsRecord | null> {
    try {
      return await pb
        .collection('payment_settings')
        .getFirstListItem<PaymentSettingsRecord>('key = "vietqr"');
    } catch {
      return null;
    }
  },

  async saveVietQr(
    existingId: string | null,
    payload: Omit<PaymentSettingsPayload, 'key'>,
  ): Promise<PaymentSettingsRecord> {
    const cleanPayload: PaymentSettingsPayload = {
      key: 'vietqr',
      bankCode: payload.bankCode.trim().toUpperCase(),
      bankName: payload.bankName.trim(),
      accountNumber: payload.accountNumber.trim().replace(/\s+/g, ''),
      accountName: payload.accountName.trim().toUpperCase(),
      template: payload.template.trim() || 'compact2',
    };
    if (existingId) {
      return pb
        .collection('payment_settings')
        .update<PaymentSettingsRecord>(existingId, cleanPayload);
    }
    return pb
      .collection('payment_settings')
      .create<PaymentSettingsRecord>(cleanPayload);
  },
};
