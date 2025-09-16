import React, { useEffect, useMemo, useState } from 'react';
import { listQuestions, removeQuestion } from '../../services/posts';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FindQuestionPage() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD"
    const [endDate, setEndDate] = useState("");
    const startAt = useMemo(
        () => (startDate ? new Date(`${startDate}T00:00:00`) : null),
        [startDate]
    );
    const endAt = useMemo(
        () => (endDate ? new Date(`${endDate}T23:59:59.999`) : null),
        [endDate]
    );

    async function reload() {
        try {
            setErr('');
            setLoading(true);
            const rows = await listQuestions();
            setItems(rows);
        } catch (e) {
            console.error('[listQuestions failed]', e);
            setErr('加载问题列表失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { reload(); }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();

        return items.filter(it => {
            // 文本匹配：若搜索词为空则视为通过
            const textOk =
                !s ||
                (it.title || '').toLowerCase().includes(s) ||
                (it.tagsText || '').toLowerCase().includes(s);

            // 日期匹配：createdAt 可能是 Firestore Timestamp 或 JS Date
            const ts = it?.createdAt?.toDate
                ? it.createdAt.toDate()
                : (it.createdAt instanceof Date ? it.createdAt : null);

            const startOk = !startAt || (ts && ts >= startAt);
            const endOk   = !endAt   || (ts && ts <= endAt);

            return textOk && startOk && endOk;
        });
    }, [items, q, startAt, endAt]);

    async function onDelete(id) {
        if (!window.confirm('Delete this question?')) return;
        await removeQuestion(id);
        await reload();
    }

    const fmtDate = (it) => {
        // Firestore serverTimestamp 可能初始为 null，需要判空
        const d = it?.createdAt?.toDate ? it.createdAt.toDate() : null;
        return d ? d.toLocaleString() : '—';
    };

    return (
        <div style={{padding: 16}}>
            <h2>Find Question</h2>

            <input
                type="text"
                placeholder="Filter by title or tags…"
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{width: '100%', marginBottom: 12}}
            />
            <div style={{display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0'}}>
                <label>Start:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                <label>End:</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}/>
            </div>

            {loading && <div style={{color: '#666'}}>Loading…</div>}
            {err && <div style={{color: '#b91c1c'}}>{err}</div>}

            {!loading && !err && filtered.length === 0 && (
                <div style={{color: '#666'}}>没有匹配的结果</div>
            )}

            <ul style={{listStyle: 'none', padding: 0}}>
                {filtered.map(it => (
                    <li key={it.id}
                        style={{
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 10
                        }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline'}}>
                            <div style={{fontWeight: 600}}>{it.title || '(Untitled)'}</div>
                            <div style={{color: '#94a3b8', fontSize: 12}}>{fmtDate(it)}</div>
                        </div>

                        {it.imageUrl && (
                            <img src={it.imageUrl} alt=""
                                 style={{maxWidth: '100%', marginTop: 8, borderRadius: 8}}/>
                        )}

                        {(it.body || it.content) && (
                            <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                                {/* 用 ReactMarkdown 渲染正文（支持 GFM：表格、任务列表、~删除线~ 等） */}
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {it.body || it.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        <div style={{marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                            {(it.tagsArray || []).map(tag => (
                                <span key={tag} style={{
                                    fontSize: 12,
                                    background: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    padding: '2px 6px',
                                    borderRadius: 999
                                }}>
                  {tag}
                </span>
                            ))}
                        </div>

                        <button onClick={() => onDelete(it.id)} style={{marginTop: 10}}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
