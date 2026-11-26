import { useCallback, useEffect, useState } from 'react';
import { Users, MessageSquareHeart, Star, Trash2, Phone, Heart } from 'lucide-react';
import { customerService } from '../../services/customerService';
import type { ReviewRecord, UserRecord } from '../../types/models';
import { extractErrorMessage } from '../../lib/pocketbase';
import { formatDateTimeVn, parseCsvList } from '../../lib/formatters';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';

export function CustomersPage() {
  const { notify } = useToast();
  const [tab, setTab] = useState<'users' | 'reviews'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReview, setDeletingReview] = useState<ReviewRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        customerService.listUsers(),
        customerService.listReviews(),
      ]);
      setUsers(u);
      setReviews(r);
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDeleteReview = async () => {
    if (!deletingReview) return;
    setBusy(true);
    try {
      await customerService.deleteReview(deletingReview.id);
      notify('Đã xóa nhận xét vi phạm.', 'info');
      setDeletingReview(null);
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1B25]">
          Khách hàng & Nhận xét phòng
        </h1>
        <p className="mt-1 text-sm text-[#666D80]">
          Theo dõi danh sách tài khoản đã đăng ký trên Mobile và kiểm duyệt đánh giá thực tế.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer ${
            tab === 'users'
              ? 'bg-[#2853AF] text-white shadow-sm'
              : 'bg-white border border-[#ECEFF3] text-[#666D80] hover:text-[#2853AF]'
          }`}
        >
          <Users className="h-4 w-4" />
          Tài khoản khách hàng ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer ${
            tab === 'reviews'
              ? 'bg-[#2853AF] text-white shadow-sm'
              : 'bg-white border border-[#ECEFF3] text-[#666D80] hover:text-[#2853AF]'
          }`}
        >
          <MessageSquareHeart className="h-4 w-4" />
          Nhận xét phòng ({reviews.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#666D80]">
          Đang tải dữ liệu…
        </div>
      ) : tab === 'users' ? (
        <div className="rounded-2xl border border-[#ECEFF3] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F8FA] text-xs uppercase text-[#666D80]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Khách hàng</th>
                  <th className="px-5 py-3.5 font-semibold">Số điện thoại / Email</th>
                  <th className="px-5 py-3.5 font-semibold">KS yêu thích</th>
                  <th className="px-5 py-3.5 font-semibold">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEFF3]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9FBFF]">
                    <td className="px-5 py-4 font-bold text-[#1A1B25]">
                      {u.name || 'Chưa cập nhật tên'}
                    </td>
                    <td className="px-5 py-4">
                      {u.phone && (
                        <p className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#2853AF]">
                          <Phone className="h-3.5 w-3.5" /> {u.phone}
                        </p>
                      )}
                      {u.email && (
                        <p className="text-xs text-[#666D80]">{u.email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                        <Heart className="h-3 w-3 fill-current" />
                        {parseCsvList(u.favorites).length} đã lưu
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#666D80]">
                      {formatDateTimeVn(u.created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[#ECEFF3] bg-white p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1A1B25]">{r.userName}</p>
                    <p className="text-xs font-semibold text-[#2853AF]">
                      {r.expand?.hotel?.name || 'Khách sạn'} · {r.roomName || 'Phòng nghỉ'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r.rating}/5
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#1A1B25] leading-relaxed">
                  {r.comment}
                </p>
                {r.tags && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {parseCsvList(r.tags).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#F6F8FA] border border-[#ECEFF3] px-2 py-0.5 text-[11px] font-medium text-[#666D80]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#ECEFF3]">
                <span className="text-[11px] text-[#666D80]">
                  {formatDateTimeVn(r.created)}
                </span>
                <button
                  type="button"
                  onClick={() => setDeletingReview(r)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa nhận xét
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingReview)}
        title="Xóa nhận xét phòng?"
        message="Nhận xét này sẽ bị gỡ khỏi trang khách sạn trên ứng dụng Mobile."
        busy={busy}
        onCancel={() => setDeletingReview(null)}
        onConfirm={handleDeleteReview}
      />
    </div>
  );
}

