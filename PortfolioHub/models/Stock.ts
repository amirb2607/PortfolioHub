export interface Stock {
    symbol: string;
    name: string;
    quantity: number;
    averagePrice: number;
    currentPrice?: any;
}  