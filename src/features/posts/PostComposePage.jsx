import React, { useState } from 'react';
import PostTypeSelector from './PostTypeSelector/PostTypeSelector';
import QuestionForm from './QuestionForm/QuestionForm';
import ArticleForm from './ArticleForm/ArticleForm';
import PostButton from './PostButton/PostButton';
import { createQuestion, createArticle } from '../../services/posts';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";


export default function PostComposePage() {
    const [type, setType] = useState('question');
    const [question, setQuestion] = useState({ title: '', body: '', tags: '', imageFile: null });
    const [article, setArticle] = useState({ title: '', abstract: '', text: '', tags: '', imageFile: null });
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const [codeBlock, setCodeBlock] = useState("// here to write your code");

    const handlePost = async () => {
        try {
            setLoading(true);
            if (type === 'question') {
                await createQuestion(question);
                setQuestion({ title: '', body: '', tags: '', imageFile: null });
            } else {
                await createArticle(article);
                setArticle({ title: '', abstract: '', text: '', tags: '', imageFile: null });
            }
            alert('Posted successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to post, please try again.');
        } finally {
            setLoading(false);
        }
    };
    const insertCodeToBody = () => {
        const fenced = `\n\n\`\`\`js\n${(codeBlock || "").trim()}\n\`\`\`\n`;
        if (type === 'question') {
            setQuestion(prev => ({ ...prev, body: (prev.body || '') + fenced }));
        } else {
            setArticle(prev => ({ ...prev, text: (prev.text || '') + fenced }));
        }
    };

    // 预览内容：问题看 body，文章看 text
    const previewMd = type === 'question'
        ? (question.body || '')
        : (article.text || '');

    const isDisabled =
        (type === 'question' && !question.title.trim()) ||
        (type === 'article' && (!article.title.trim() || !article.abstract.trim()));

    return (
        <div style={{background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16}}>
            <div style={{textAlign: 'right', marginBottom: 8}}>
                <Link to="/posts/find">Go to Find Question →</Link>

            </div>

            <PostTypeSelector value={type} onChange={setType}/>
            <hr style={{border: 0, borderTop: '1px solid #e5e7eb', margin: '12px 0'}}/>

            {type === 'question' ? (
                <QuestionForm values={question} onChange={setQuestion}/>
            ) : (
                <ArticleForm values={article} onChange={setArticle}/>
            )}

            <hr style={{border: 0, borderTop: '1px solid #e5e7eb', margin: '16px 0'}}/>
            {/* === 代码编辑区（只影响正文，不改提交流程） === */}
            <div style={{ marginTop: 12, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ flex: 1 }}>code（CodeMirror 6）</strong>
                    <button
                        type="button"
                        onClick={insertCodeToBody}
                        style={{ padding: '6px 10px', fontWeight: 600 }}
                        title="把上面的代码作为 ```js 代码块 插入到正文"
                    >
                        insert into paragraph
                    </button>
                </div>

                <CodeMirror
                   value={codeBlock}
                   options={{ mode: "javascript", theme: "material", lineNumbers: true }}
                   onBeforeChange={(_ed, _data, value) => setCodeBlock(value)}
                 />
            </div>


            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>预览（Markdown 渲染）</h3>
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {previewMd}
                    </ReactMarkdown>
                </div>
            </div>

            <PostButton onClick={handlePost} disabled={isDisabled} loading={loading}/>
        </div>

    );
}
