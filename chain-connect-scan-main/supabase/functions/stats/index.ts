import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for unrestricted access to tables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header required');
    
    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    // Handle both GET and POST methods
    let sellerId = user.id;
    
    if (req.method === 'POST') {
      const body = await req.json();
      sellerId = body.seller_id || user.id;
    }

    if (req.method === 'GET' || req.method === 'POST') {
      const url = new URL(req.url);
      const period = url.searchParams.get('period') || '30'; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get seller statistics
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('id, name, price, currency, stock_quantity, created_at')
        .eq('seller_id', sellerId)
        .eq('is_active', true);

      if (productsError) throw productsError;

      const { data: orders, error: ordersError } = await supabaseClient
        .from('orders')
        .select(`
          id, total_amount, currency, status, created_at,
          order_items (
            quantity, total_price,
            products (name, category)
          )
        `)
        .eq('seller_id', sellerId)
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Get wallet with service role key for proper access
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .select('*')
        .eq('user_id', sellerId)
        .maybeSingle();

      console.log('Wallet query result:', { wallet, walletError, sellerId });

      if (walletError) {
        console.error('Wallet error:', walletError);
        // Don't throw, just log and continue with default values
      }

      // Only fetch transactions if wallet exists
      let transactions = [];
      if (wallet) {
        const { data: txData, error: txError } = await supabaseClient
          .from('transactions')
          .select('amount, currency, type, created_at')
          .eq('wallet_id', wallet.id)
          .gte('created_at', startDate.toISOString());

        if (txError) throw txError;
        transactions = txData || [];
      }

      // Calculate statistics
      const totalProducts = products.length;
      const totalOrders = orders.length;
      
      const totalRevenue = orders.reduce((sum, order) => {
        if (order.status === 'delivered' || order.status === 'completed') {
          return sum + (parseFloat(order.total_amount) || 0);
        }
        return sum;
      }, 0);

      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Top selling products
      const productSales = {};
      orders.forEach(order => {
        order.order_items.forEach(item => {
          const productName = item.products.name;
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              category: item.products.category,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += parseFloat(item.total_price) || 0;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by day for chart
      const revenueByDay = orders.reduce((acc, order) => {
        if (order.status === 'delivered' || order.status === 'completed') {
          const date = new Date(order.created_at).toDateString();
          acc[date] = (acc[date] || 0) + (parseFloat(order.total_amount) || 0);
        }
        return acc;
      }, {});

      // Get reviews and ratings
      const { data: reviews, error: reviewsError } = await supabaseClient
        .from('reviews')
        .select('rating, comment, created_at, is_verified')
        .eq('seller_id', sellerId);

      const averageRating = reviews?.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      const ratingDistribution = reviews?.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {}) || {};

      // Commission earnings from affiliates
      const { data: affiliateEarnings, error: affiliateError } = await supabaseClient
        .from('affiliates')
        .select('total_earnings, commission_rate')
        .eq('seller_id', sellerId);

      const totalAffiliateEarnings = affiliateEarnings?.reduce((sum, affiliate) => 
        sum + (parseFloat(affiliate.total_earnings) || 0), 0) || 0;

      // Revenue by month for trend analysis
      const revenueByMonth = orders.reduce((acc, order) => {
        if (order.status === 'delivered' || order.status === 'completed') {
          const month = new Date(order.created_at).toISOString().slice(0, 7); // YYYY-MM
          acc[month] = (acc[month] || 0) + (parseFloat(order.total_amount) || 0);
        }
        return acc;
      }, {});

      // Daily revenue for the last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyRevenue = last30Days.map(date => {
        const dayOrders = orders.filter(order => 
          (order.status === 'delivered' || order.status === 'completed') &&
          order.created_at.startsWith(date)
        );
        const revenue = dayOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        return { date, revenue, orders: dayOrders.length };
      });

      return new Response(JSON.stringify({
        summary: {
          totalProducts,
          totalOrders,
          totalRevenue,
          totalAffiliateEarnings,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalReviews: reviews?.length || 0,
          conversionRate: totalOrders > 0 ? ((ordersByStatus.delivered || 0) / totalOrders * 100).toFixed(2) : 0,
        },
        ordersByStatus,
        topProducts,
        reviews: {
          average: parseFloat(averageRating.toFixed(1)),
          total: reviews?.length || 0,
          distribution: ratingDistribution,
          recent: reviews?.slice(0, 5) || []
        },
        revenue: {
          daily: dailyRevenue,
          monthly: Object.entries(revenueByMonth).map(([month, revenue]) => ({
            month,
            revenue,
          })).sort((a, b) => a.month.localeCompare(b.month)),
          byDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
            date,
            revenue,
          }))
        },
        wallet: wallet ? {
          balance_gnf: wallet.balance_gnf || 0,
          balance_usd: wallet.balance_usd || 0,
          balance_eur: wallet.balance_eur || 0,
          balance_xof: wallet.balance_xof || 0,
          balance_cny: wallet.balance_cny || 0,
          is_frozen: wallet.is_frozen || false,
        } : {
          balance_gnf: 0,
          balance_usd: 0,
          balance_eur: 0,
          balance_xof: 0,
          balance_cny: 0,
          is_frozen: false,
        },
        recentTransactions: transactions.slice(0, 10),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Stats API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});