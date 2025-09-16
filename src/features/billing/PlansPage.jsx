import { useNavigate } from "react-router-dom";

export default function PlansPage() {
    const navigate = useNavigate();
    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
            <h1>Pricing Plans</h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
                    <h2>Free</h2>
                    <ul>
                        <li>基础功能：发帖、阅读</li>
                        <li>Markdown 渲染与代码高亮</li>
                    </ul>
                    <button onClick={() => navigate("/home")}>继续使用 Free</button>
                </div>
                <div style={{ border: "2px solid #222", padding: 16, borderRadius: 12 }}>
                    <h2>Premium</h2>
                    <ul>
                        <li>主题和横幅/消息</li>
                        <li>内容控制或管理支持</li>
                        <li>（可选）分析仪表盘</li>
                    </ul>
                    {/* 价格仅示例：$5.00 AUD -> 500 分 */}
                    <button onClick={() => navigate("/checkout?amount=500&currency=AUD")}>
                        Go Premium ($5)
                    </button>
                </div>
            </div>
        </div>
    );
}
