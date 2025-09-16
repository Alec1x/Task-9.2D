// src/services/posts.js
import {
    collection, addDoc, deleteDoc, doc,
    getDocs, query, orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, ts } from '../lib/firebase';

// 可选：把 "a, b, c" 这样的字符串转数组；如果本来就是数组，原样返回
function toTagsArray(tags) {
    if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') {
        return tags.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

async function maybeUploadImage(file, folder = 'uploads') {
    if (!file) return '';
    const path = `${folder}/${Date.now()}_${file.name}`;
    const r = ref(storage, path);
    await uploadBytes(r, file);
    return getDownloadURL(r);
}

/** 发“问题” */
export async function createQuestion({ title, body, tags = '', imageFile = null }) {
    if (!title?.trim() || !body?.trim()) {
        throw new Error('title 与 body 不能为空');
    }
    const imageUrl = await maybeUploadImage(imageFile, 'questions');
    const payload = {
        title: title.trim(),
        body: body.trim(),
        tags: toTagsArray(tags),
        imageUrl,
        createdAt: ts(),        // 关键：serverTimestamp()
    };
    const res = await addDoc(collection(db, 'questions'), payload);
    return res.id;
}

/** 发“文章”（对应你的 ArticleForm 字段） */
export async function createArticle({ title, abstract = '', text = '', tags = '', imageFile = null }) {
    if (!title?.trim() || !abstract?.trim()) {
        throw new Error('title 与 abstract 不能为空');
    }
    const imageUrl = await maybeUploadImage(imageFile, 'articles');
    const payload = {
        title: title.trim(),
        abstract: abstract.trim(),
        text: text?.trim?.() ?? '',
        tags: toTagsArray(tags),
        imageUrl,
        createdAt: ts(),
    };
    const res = await addDoc(collection(db, 'articles'), payload);
    return res.id;
}

/** Find Question 列表（按时间倒序） */
// src/services/posts.js
export async function listQuestions() {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = d.data();
        // 统一出两个便于前端使用的派生字段
        const tagsArray = Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' && data.tags.trim() ? data.tags.split(',').map(s=>s.trim()).filter(Boolean) : []);
        const tagsText  = tagsArray.join(', ');
        return { id: d.id, ...data, tagsArray, tagsText };
    });
}


/** 删除问题（可选） */
export async function removeQuestion(id) {
    await deleteDoc(doc(db, 'questions', id));
}
