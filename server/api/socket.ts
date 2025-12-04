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

io.on('connection', (socket) => {
    console.log('匿名用户连接:', socket.id);
    count++;
    let currentPageId: number | null = null;

    // 用户加入特定白板页面
    socket.on('join_page', async ({ pageId }: { pageId: number }) => {
        currentPageId = pageId;
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
        if (!currentPageId) return;

        try {
            const [result] = await pool.query(
                'INSERT INTO whiteboard_elements (page_id, `data`) VALUES (?, ?)',
                [currentPageId, JSON.stringify(elementData)]
            );
            const insertId = (result as any).insertId;

            //  添加服务器生成的ID
            const elementToBroadcast = {
                ...elementData,
                // id: insertId,
            };

            // 广播给同房间的其他所有用户（除了发送者自己）
            socket.to(`page:${currentPageId}`).emit('element_created', elementToBroadcast);
            console.log(`广播新元素: ${elementData.type} (ID: ${insertId})`);

        } catch (error) {
            console.error('创建元素失败:', error);
            socket.emit('operation_error', { message: '创建失败' });
        }
    });

    // 处理客户端的更新元素操作（移动、缩放、修改属性等）
    socket.on('element_update', async ({ id, data }) => {
        console.log(`收到元素更新请求: ${id}`);
        if (!currentPageId) return;

        try {
            await pool.query(
                'UPDATE whiteboard_elements SET `data` = ? WHERE id = ? AND page_id = ?',
                [JSON.stringify(data), id, currentPageId]
            );
            socket.to(`page:${currentPageId}`).emit('element_updated', { id, data });
            console.log(`广播元素更新: ID ${id}`);

        } catch (error) {
            console.error('更新元素失败:', error);
        }
    });

    // 处理客户端的删除元素操作
    socket.on('element_delete', async (elementId: number) => {
        if (!currentPageId) return;

        try {
            await pool.query(
                'DELETE FROM whiteboard_elements WHERE id = ? AND page_id = ?',
                [elementId, currentPageId]
            );

            socket.to(`page:${currentPageId}`).emit('element_deleted', elementId);
            console.log(`广播元素删除: ID ${elementId}`);

        } catch (error) {
            console.error('删除元素失败:', error);
        }
    });

    // 处理画笔路径的实时更新（针对Free类型）
    socket.on('draw_update', ({ elementId, path }) => {
        if (!currentPageId) return;
        socket.to(`page:${currentPageId}`).emit('draw_updated', { elementId, path });
    });

    // 用户断开连接
    socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);
        count--;
    });

    //定时发送在线人数
    setInterval(() => {
        io.emit('online_count', count);
        console.log(`当前在线人数: ${count}`);
    },
        25000)

});

const PORT = 3002;
httpServer.listen(PORT, () => {
    console.log(`协同WebSocket服务器运行在: http://localhost:${PORT}`);
});