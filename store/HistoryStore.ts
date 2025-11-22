//这个是一个历史记录模块，保持单例模式和全局存在
import { defineStore } from 'pinia'
import type { WhithBoardItemProps } from '../types/type';

interface HistoryState {
    id: string;
    item: WhithBoardItemProps;
}


export const useHistoryStore = defineStore('historyStore', {
    state: () => {
        return {
            history: [] as HistoryState[],
            cur: 0,
        }
    },
    actions: {
        initHistory(item: WhithBoardItemProps) {
            this.history = [{ id: String(Date.now()), item }];
            this.cur = 0;
        },
        addHistory(item: WhithBoardItemProps) {
            //如果当前不是最后一个，则删除后面的历史记录
            if (this.cur < this.history.length - 1) {
                this.history = this.history.slice(0, this.cur + 1);
            }
            this.history.push({ id: String(Date.now()), item });
            this.cur++;
        },
        undo(): WhithBoardItemProps | null {
            if (this.cur > 0) {
                this.cur--;
                return this.history[this.cur]!.item;
            }
            return null;
        },
        redo(): WhithBoardItemProps | null {
            if (this.cur < this.history.length - 1) {
                this.cur++;
                return this.history[this.cur]!.item;
            }
            return null;
        },
        getCurrent(): WhithBoardItemProps {
            if (this.history.length > 0) {
                return this.history[this.cur]!.item;
            }
            throw new Error("No history available");
        },

        clearHistory() {
            this.history = [];
            this.cur = 0;
        },
        getHistory(): HistoryState[] {
            return this.history;
        },
        getCur(): number {
            return this.cur;
        },
        setCur(cur: number) {
            this.cur = cur;
        }
    }
})