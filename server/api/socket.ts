// 建立websocket连接
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { useRuntimeConfig } from '#imports';
import mysql from 'mysql2/promise';

const config = useRuntimeConfig();
const pool = mysql.createPool({
    host: '47.112.109.9',
    user: 'root',
    password: 'Root_123',
    database: 'whiteboard_db',
    waitForConnections: true,
    connectionLimit: 10,
});

const httpServer = createServer();
let count = 0;
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// 存储用户信息的Map
const userRooms = new Map<string, number>();

io.on('connection', (socket) => {
    console.log('匿名用户连接:', socket.id);
    count++;
    let currentPageId: number | null = null;

    // 用户加入特定白板页面
    socket.on('join_page', async ({ pageId }: { pageId: number }) => {
        // 如果已经加入过其他页面，先通知旧房间用户离开
        if (currentPageId) {
            socket.to(`page:${currentPageId}`).emit('mouse_leave', { id: socket.id });
            socket.leave(`page:${currentPageId}`);
        }
        
        currentPageId = pageId;
        userRooms.set(socket.id, pageId);
        socket.join(`page:${pageId}`);
        console.log(`用户 ${socket.id} 加入页面 ${pageId}`);

        // 为新用户发送当前页面的完整元素列表
        try {
            const [elements] = await pool.query(
                'SELECT id, `data` FROM whiteboard_elements WHERE page_id = ? ORDER BY id',
                [pageId]
            );
            socket.emit('initial_elements', { elements });
        } catch (error) {
            console.error('获取初始元素失败:', error);
        }
    });

    // 处理客户端的新增元素操作
    socket.on('element_create', async (elementData) => {
        if (!currentPageId) {
            console.error(`用户 ${socket.id} 未加入任何页面，无法创建元素`);
            return;
        }

        try {
            const [result] = await pool.query(
                'INSERT INTO whiteboard_elements (page_id, `data`) VALUES (?, ?)',
                [currentPageId, JSON.stringify(elementData)]
            );
            const insertId = (result as any).insertId;

            // 添加服务器生成的ID
            const elementToBroadcast = {
                ...elementData,
                id: insertId,
            };

            // 广播给同房间的其他所有用户（除了发送者自己）
            socket.to(`page:${currentPageId}`).emit('element_created', elementToBroadcast);
            console.log(`广播新元素: ${elementData.type} (ID: ${insertId}) 到页面 ${currentPageId}`);

        } catch (error) {
            console.error('创建元素失败:', error);
            socket.emit('operation_error', { message: '创建失败' });
        }
    });

    // 处理客户端的更新元素操作（移动、缩放、修改属性等）
    socket.on('element_update', async ({ id, data }) => {
        console.log(`收到元素更新请求: ${id}，当前页面: ${currentPageId}`);
        if (!currentPageId) {
            console.error(`用户 ${socket.id} 未加入任何页面，无法更新元素`);
            return;
        }

        try {
            await pool.query(
                'UPDATE whiteboard_elements SET `data` = ? WHERE id = ? AND page_id = ?',
                [JSON.stringify(data), id, currentPageId]
            );
            socket.to(`page:${currentPageId}`).emit('element_updated', { id, data });
            console.log(`广播元素更新: ID ${id} 到页面 ${currentPageId}`);

        } catch (error) {
            console.error('更新元素失败:', error);
        }
    });

    // 处理客户端的删除元素操作
    socket.on('element_delete', async (elementId: number) => {
        if (!currentPageId) {
            console.error(`用户 ${socket.id} 未加入任何页面，无法删除元素`);
            return;
        }

        try {
            await pool.query(
                'DELETE FROM whiteboard_elements WHERE id = ? AND page_id = ?',
                [elementId, currentPageId]
            );

            socket.to(`page:${currentPageId}`).emit('element_deleted', elementId);
            console.log(`广播元素删除: ID ${elementId} 到页面 ${currentPageId}`);

        } catch (error) {
            console.error('删除元素失败:', error);
        }
    });

    // 处理画笔路径的实时更新（针对Free类型）
    socket.on('draw_update', ({ elementId, path }) => {
        if (!currentPageId) {
            console.error(`用户 ${socket.id} 未加入任何页面，无法更新画笔`);
            return;
        }
        socket.to(`page:${currentPageId}`).emit('draw_updated', { elementId, path });
        console.log(`广播画笔更新: 元素 ${elementId} 到页面 ${currentPageId}`);
    });

    // 用户发送自己鼠标的位置
    socket.on('mouse_move', ({ x, y, user }) => {
        if (!currentPageId) {
            // 用户未加入任何页面，不广播鼠标位置
            return;
        }
        // 只广播给当前房间的其他用户
        socket.to(`page:${currentPageId}`).emit('mouse_move', { x, y, user, id: socket.id });
    });

    // 用户移除鼠标
    socket.on('mouse_leave', () => {
        if (!currentPageId) return;
        socket.to(`page:${currentPageId}`).emit('mouse_leave', { id: socket.id });
    })

    // 切换项目
    socket.on('switch_project', (pageId) => {
        console.log(`用户 ${socket.id} 切换项目: 从 ${currentPageId} 到 ${pageId}`);
        
        // 确保 pageId 是数字
        const newPageId = Number(pageId);
        if (isNaN(newPageId)) {
            console.error(`切换项目失败: pageId "${pageId}" 不是有效的数字`);
            socket.emit('switch_error', { message: '页面ID无效' });
            return;
        }
        
        // 离开旧房间之前，通知旧房间用户鼠标离开
        if (currentPageId) {
            socket.to(`page:${currentPageId}`).emit('mouse_leave', { id: socket.id });
            socket.leave(`page:${currentPageId}`);
            console.log(`用户 ${socket.id} 离开页面 ${currentPageId}，并通知鼠标离开`);
        }
        
        // 更新当前页面ID并加入新房间
        currentPageId = newPageId;
        userRooms.set(socket.id, newPageId);
        socket.join(`page:${newPageId}`);
        
        console.log(`用户 ${socket.id} 加入页面 ${newPageId}`);
        
        // 发送新页面的初始元素
        pool.query(
            'SELECT id, `data` FROM whiteboard_elements WHERE page_id = ? ORDER BY id',
            [newPageId]
        ).then(([elements]) => {
            socket.emit('initial_elements', { elements });
            console.log(`已发送页面 ${newPageId} 的初始元素给用户 ${socket.id}`);
        }).catch(error => {
            console.error('切换项目时获取元素失败:', error);
            socket.emit('operation_error', { message: '获取页面元素失败' });
        });
    });

    // 用户断开连接
    socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);
        // 通知用户所在房间的其他用户该用户已离开
        if (currentPageId) {
            socket.to(`page:${currentPageId}`).emit('mouse_leave', { id: socket.id });
        }
        userRooms.delete(socket.id);
        count--;
    });

    // 定时发送在线人数
    setInterval(() => {
        io.emit('online_count', count);
        console.log(`当前在线人数: ${count}`);
    }, 25000);
});

const PORT = 3002;
httpServer.listen(PORT, () => {
    console.log(`协同WebSocket服务器运行在: http://localhost:${PORT}`);
});