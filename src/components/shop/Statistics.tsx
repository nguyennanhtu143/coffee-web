import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { StatisticOverview, RevenueData } from '../../types';
import styles from './Statistics.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATE_LABELS: Record<string, string> = {
    PENDING_PAYMENT: 'Chờ xác nhận',
    CONFIRMED:       'Đã xác nhận',
    SHIPPING:        'Đang vận chuyển',
    DELIVERING:      'Đang giao',
    COMPLETED:       'Hoàn thành',
    CANCELED:        'Đã hủy',
};

const QUICK_RANGES = [
    { label: '7 ngày',   days: 7   },
    { label: '30 ngày',  days: 30  },
    { label: '90 ngày',  days: 90  },
    { label: '6 tháng',  days: 180 },
];

const MAX_RANGE_DAYS = 184;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
    // Format yyyy-MM-dd in local timezone
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function defaultRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start: toDateStr(start), end: toDateStr(end) };
}

function daysBetween(s: string, e: string): number {
    return Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86_400_000);
}

/** Định dạng số tiền gọn: 1.5tr, 200k, 500 */
function fmtShort(v: number): string {
    if (v >= 1_000_000) {
        const n = v / 1_000_000;
        return (Number.isInteger(n) ? n : n.toFixed(1)) + 'tr';
    }
    if (v >= 1_000) return Math.round(v / 1_000) + 'k';
    return String(v);
}

/** Định dạng số tiền đầy đủ */
function fmtVND(v: number): string {
    return v.toLocaleString('vi-VN') + '₫';
}

/** Tính 5 mức Y-axis "đẹp" */
function buildYTicks(maxVal: number, steps = 5): number[] {
    if (maxVal <= 0) return [0, 25_000, 50_000, 75_000, 100_000];
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const nice = Math.ceil(maxVal / magnitude) * magnitude;
    return Array.from({ length: steps }, (_, i) => Math.round((nice / (steps - 1)) * i));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Statistics() {
    const init = defaultRange();

    // Date picker state (chưa áp dụng)
    const [startDate, setStartDate] = useState(init.start);
    const [endDate,   setEndDate]   = useState(init.end);

    // Applied range (đã nhấn Áp dụng / quick button)
    const [appliedStart, setAppliedStart] = useState(init.start);
    const [appliedEnd,   setAppliedEnd]   = useState(init.end);

    const [overview,        setOverview]        = useState<StatisticOverview | null>(null);
    const [revenue,         setRevenue]         = useState<RevenueData[]>([]);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [loadingRevenue,  setLoadingRevenue]  = useState(false);
    const [error,           setError]           = useState('');

    // Tooltip state
    const [tooltip, setTooltip] = useState<{
        data: RevenueData;
        x: number;
        y: number;
    } | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchData = useCallback((s: string, e: string) => {
        setError('');
        const days = daysBetween(s, e);
        if (days < 0) {
            setError('Ngày bắt đầu phải trước ngày kết thúc.');
            return;
        }
        if (days > MAX_RANGE_DAYS) {
            setError(`Khoảng thời gian tối đa là 6 tháng (${MAX_RANGE_DAYS} ngày).`);
            return;
        }

        setLoadingOverview(true);
        axiosClient
            .get(`/statistic/overview?startDate=${s}&endDate=${e}`)
            .then((d: any) => setOverview(d))
            .catch(() => setError('Không thể tải dữ liệu tổng quan.'))
            .finally(() => setLoadingOverview(false));

        setLoadingRevenue(true);
        axiosClient
            .get(`/statistic/revenue-by-days?startDate=${s}&endDate=${e}`)
            .then((d: any) => setRevenue(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoadingRevenue(false));
    }, []);

    useEffect(() => {
        fetchData(appliedStart, appliedEnd);
    }, [appliedStart, appliedEnd, fetchData]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleApply = () => {
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
    };

    const handleQuick = (days: number) => {
        const e = toDateStr(new Date());
        const s = toDateStr(new Date(Date.now() - (days - 1) * 86_400_000));
        setStartDate(s);
        setEndDate(e);
        setAppliedStart(s);
        setAppliedEnd(e);
    };

    const handleBarEnter = (e: React.MouseEvent, item: RevenueData) => {
        setTooltip({ data: item, x: e.clientX, y: e.clientY });
    };
    const handleBarMove = (e: React.MouseEvent) => {
        if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
    };
    const handleBarLeave = () => setTooltip(null);

    // ── Chart calculations ─────────────────────────────────────────────────────

    const maxRev  = Math.max(...revenue.map(r => r.totalRevenue), 0);
    const yTicks  = buildYTicks(maxRev);
    const chartMax = yTicks[yTicks.length - 1] || 1;

    // ── Stat cards ─────────────────────────────────────────────────────────────

    const cards = [
        { label: 'Doanh thu',        value: fmtVND(overview?.totalRevenue ?? 0)          },
        { label: 'Tổng đơn hàng',    value: overview?.totalOrders          ?? '—'        },
        { label: 'Đơn hoàn thành',   value: overview?.totalCompletedOrders ?? '—'        },
        { label: 'Đơn đã hủy',       value: overview?.totalCanceledOrders  ?? '—'        },
    ];

    // ── Which quick button is active ───────────────────────────────────────────
    const appliedDays = daysBetween(appliedStart, appliedEnd) + 1;

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={styles.container}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <h2>Thống kê doanh thu</h2>
                <p>Báo cáo theo khoảng thời gian tùy chọn</p>
            </div>

            {/* ── Date range bar ── */}
            <div className={styles.dateRangeBar}>
                <label>Từ ngày</label>
                <input
                    id="stat-start-date"
                    type="date"
                    className={styles.dateInput}
                    value={startDate}
                    max={endDate}
                    onChange={e => setStartDate(e.target.value)}
                />
                <label>Đến ngày</label>
                <input
                    id="stat-end-date"
                    type="date"
                    className={styles.dateInput}
                    value={endDate}
                    min={startDate}
                    max={toDateStr(new Date())}
                    onChange={e => setEndDate(e.target.value)}
                />
                <button id="stat-apply-btn" className={styles.applyBtn} onClick={handleApply}>
                    Áp dụng
                </button>

                <div className={styles.divider} />

                <div className={styles.quickBtns}>
                    {QUICK_RANGES.map(q => (
                        <button
                            key={q.days}
                            className={`${styles.quickBtn} ${appliedDays === q.days ? styles.quickBtnActive : ''}`}
                            onClick={() => handleQuick(q.days)}
                        >
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

            {/* ── Overview cards ── */}
            {loadingOverview ? (
                <div className={styles.loading}>⏳ Đang tải...</div>
            ) : (
                <div className={styles.statsGrid}>
                    {cards.map((c, i) => (
                        <div key={i} className={styles.statCard}>
                            <div className={styles.statLabel}>{c.label}</div>
                            <div className={styles.statValue}>{String(c.value)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Revenue chart ── */}
            <div className={styles.chartCard}>
                <p className={styles.sectionTitle}>
                    Doanh thu theo ngày
                    {loadingRevenue && (
                        <span className={styles.sectionBadge}>Đang tải...</span>
                    )}
                </p>

                <div className={styles.chartOuter}>
                    {/* Y-axis */}
                    <div className={styles.yAxis}>
                        {[...yTicks].reverse().map((v, i) => (
                            <span key={i} className={styles.yLabel}>{fmtShort(v)}</span>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className={styles.barsArea}>
                        {revenue.map((r, i) => {
                            const heightPct = chartMax > 0
                                ? Math.max((r.totalRevenue / chartMax) * 100, r.totalRevenue > 0 ? 1 : 0)
                                : 0;
                            const day = r.period?.slice(8) ?? ''; // lấy phần DD
                            return (
                                <div
                                    key={i}
                                    className={styles.barWrapper}
                                    onMouseEnter={e => handleBarEnter(e, r)}
                                    onMouseMove={handleBarMove}
                                    onMouseLeave={handleBarLeave}
                                >
                                    <div
                                        className={styles.barFill}
                                        style={{ height: `${heightPct}%` }}
                                    />
                                    <span className={styles.xLabel}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Orders by state ── */}
            <p className={styles.sectionTitle}>Đơn hàng theo trạng thái</p>
            <div className={styles.tagList}>
                {overview?.ordersByState?.map(s => (
                    <span key={s.state} className={styles.tag}>
                        {STATE_LABELS[s.state] ?? s.state}: <strong>{s.count}</strong>
                    </span>
                ))}
            </div>

            {/* ── Top products (all-time) ── */}
            <p className={styles.sectionTitle}>
                Top sản phẩm bán chạy
                <span className={styles.sectionBadge}>All-time</span>
            </p>
            <div className={styles.chartCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 48, textAlign: 'center' }}>#</th>
                            <th>Sản phẩm</th>
                            <th style={{ textAlign: 'center' }}>Đã bán</th>
                            <th style={{ textAlign: 'right' }}>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overview?.topProducts?.map((p, i) => (
                            <tr key={i}>
                                <td style={{ textAlign: 'center' }}>
                                    <div className={`${styles.rank} ${
                                        i === 0 ? styles.rank1
                                        : i === 1 ? styles.rank2
                                        : i === 2 ? styles.rank3
                                        : styles.rankOther
                                    }`}>
                                        {i + 1}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.productCell}>
                                        {p.image && (
                                            <img src={p.image} alt="" className={styles.productImg} />
                                        )}
                                        <span>{p.productName}</span>
                                        {p.size && (
                                            <span className={styles.sizeTag}>({p.size})</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>{p.totalQuantitySold}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {fmtVND(p.totalRevenue ?? 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Tooltip ── */}
            {tooltip && (
                <div
                    className={styles.tooltip}
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className={styles.tooltipDate}>📅 {tooltip.data.period}</div>
                    <div className={styles.tooltipRow}>💰 {fmtVND(tooltip.data.totalRevenue)}</div>
                    <div className={styles.tooltipRow}>📦 {tooltip.data.totalOrders} đơn hoàn thành</div>
                </div>
            )}
        </div>
    );
}
