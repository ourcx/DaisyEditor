// service/ProductService.js
export const ProductService = {
    async getProductsSmall() {
        // 模拟异步请求
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1000',
                        code: 'f230fh0g3',
                        name: '实时协作空间',
                        image: 'bamboo-watch.jpg',
                        price: 0,
                        inventoryStatus: 'INSTOCK',
                        description: '支持多人实时协作编辑文档'
                    },
                    {
                        id: '1001',
                        code: 'nvklal433',
                        name: '版本历史管理',
                        image: 'black-watch.jpg',
                        price: 0,
                        inventoryStatus: 'INSTOCK',
                        description: '完整的版本控制和历史记录'
                    },
                    {
                        id: '1002',
                        code: 'zz21cz3c1',
                        name: '智能评论系统',
                        image: 'blue-band.jpg',
                        price: 0,
                        inventoryStatus: 'LOWSTOCK',
                        description: '支持@提及和线程评论'
                    },
                    {
                        id: '1003',
                        code: '244wgerg2',
                        name: '多格式导出',
                        image: 'blue-t-shirt.jpg',
                        price: 0,
                        inventoryStatus: 'INSTOCK',
                        description: '支持PDF、Word、Markdown导出'
                    },
                    {
                        id: '1004',
                        code: 'h456wer53',
                        name: '权限管理',
                        image: 'bracelet.jpg',
                        price: 0,
                        inventoryStatus: 'INSTOCK',
                        description: '精细的文档权限控制'
                    },
                    {
                        id: '1005',
                        code: 'av2231fwg',
                        name: 'AI智能助手',
                        image: 'brown-purse.jpg',
                        price: 99,
                        inventoryStatus: 'OUTOFSTOCK',
                        description: 'AI驱动的写作辅助和内容优化'
                    }
                ]);
            }, 100);
        });
    }
};






