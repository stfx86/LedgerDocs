
import { useState, useEffect } from 'react';
import { useUser } from "@/contexts/UserContext";

// Types for the dashboard data
export interface DocumentData {
    id: number;
    title: string;
    price: string;
    sales: number;
    earnings: string;
    views: number;
    status: string;
}

export interface SaleData {
    id: number;
    document: string;
    buyer: string;
    amount: string;
    date: string;
}

export interface PurchaseData {
    id: number;
    title: string;
    author: string;
    price: string;
    purchaseDate: string;
    downloaded: boolean;
}

export interface DashboardStats {
    totalEarnings: string;
    totalSales: number;
    totalDocuments: number;
    totalViews: number;
}

// Mock data functions - replace these with actual API calls later
const fetchMyDocuments = async (): Promise<DocumentData[]> => {
    // TODO: Replace with actual API call
    return [
        {
            id: 1,
            title: "Complete Web3 Development Guide",
            price: "0.05",
            sales: 24,
            earnings: "1.08",
            views: 1200,
            status: "active",
        },
        {
            id: 2,
            title: "Smart Contract Security Best Practices",
            price: "0.03",
            sales: 18,
            earnings: "0.486",
            views: 850,
            status: "active",
        },
        {
            id: 3,
            title: "DeFi Protocol Analysis Framework",
            price: "0.08",
            sales: 5,
            earnings: "0.36",
            views: 320,
            status: "active",
        },
    ];
};

const fetchSalesHistory = async (): Promise<SaleData[]> => {
    // TODO: Replace with actual API call
    return [
        {
            id: 1,
            document: "Complete Web3 Development Guide",
            buyer: "0x1234...5678",
            amount: "0.05",
            date: "2024-03-15",
        },
        {
            id: 2,
            document: "Smart Contract Security Best Practices",
            buyer: "0x8765...4321",
            amount: "0.03",
            date: "2024-03-14",
        },
        {
            id: 3,
            document: "Complete Web3 Development Guide",
            buyer: "0xabcd...efgh",
            amount: "0.05",
            date: "2024-03-14",
        },
    ];
};

const fetchPurchases = async (): Promise<PurchaseData[]> => {
    // TODO: Replace with actual API call
    return [
        {
            id: 1,
            title: "Advanced Solidity Patterns",
            author: "Jane Doe",
            price: "0.04",
            purchaseDate: "2024-03-10",
            downloaded: true,
        },
        {
            id: 2,
            title: "NFT Marketplace Development",
            author: "John Smith",
            price: "0.06",
            purchaseDate: "2024-03-08",
            downloaded: false,
        },
    ];
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
    // TODO: Replace with actual API call
    return {
        totalEarnings: "2.45",
        totalSales: 47,
        totalDocuments: 8,
        totalViews: 3420,
    };
};

// Custom hook for dashboard data
export const useDashboardData = () => {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [sales, setSales] = useState<SaleData[]>([]);
    const [purchases, setPurchases] = useState<PurchaseData[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [documentsData, salesData, purchasesData, statsData] = await Promise.all([
                    fetchMyDocuments(),
                                                                                               fetchSalesHistory(),
                                                                                               fetchPurchases(),
                                                                                               fetchDashboardStats(),
                ]);

                setDocuments(documentsData);
                setSales(salesData);
                setPurchases(purchasesData);
                setStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const refetchData = async () => {
        const [documentsData, salesData, purchasesData, statsData] = await Promise.all([
            fetchMyDocuments(),
                                                                                       fetchSalesHistory(),
                                                                                       fetchPurchases(),
                                                                                       fetchDashboardStats(),
        ]);

        setDocuments(documentsData);
        setSales(salesData);
        setPurchases(purchasesData);
        setStats(statsData);
    };

    return {
        documents,
        sales,
        purchases,
        stats,
        loading,
        error,
        refetchData,
    };
};
