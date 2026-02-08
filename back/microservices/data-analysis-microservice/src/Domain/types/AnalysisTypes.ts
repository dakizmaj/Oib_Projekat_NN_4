export interface MonthData {
    month: string;
    revenue: number;
}

export interface YearData {
    year: string;
    revenue: number;
}

export interface WeekData {
    week: number;
    year: number;
    revenue: number;
}

export interface TrendData {
    date: string;
    revenue: number;
    sales: number;
}

export interface Revenue{
    revenue: number;
}