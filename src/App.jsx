import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, Search, Moon, Sun, Wallet, LineChart, X, RefreshCw, DollarSign, Activity, BarChart3, Eye } from 'lucide-react';

const CryptoDashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [watchlist, setWatchlist] = useState(new Set(['bitcoin', 'ethereum', 'cardano']));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [globalStats, setGlobalStats] = useState({});
  const [portfolio] = useState({
    bitcoin: { amount: 0.5, buyPrice: 42000 },
    ethereum: { amount: 3.2, buyPrice: 2800 }
  });

  const newsItems = [
    { title: 'Bitcoin Surges Past $67K as Institutional Interest Grows', time: '2 hours ago', category: 'Bitcoin' },
    { title: 'Ethereum 2.0 Staking Reaches New All-Time High', time: '4 hours ago', category: 'Ethereum' },
    { title: 'Major Bank Announces Crypto Custody Services', time: '6 hours ago', category: 'Adoption' },
    { title: 'DeFi Protocol Records $1B in Daily Volume', time: '8 hours ago', category: 'DeFi' },
    { title: 'SEC Approves New Crypto ETF Applications', time: '1 day ago', category: 'Regulation' }
  ];

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h'
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      const formattedData = data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        sparkline: coin.sparkline_in_7d?.price?.slice(-20) || [],
        logo: coin.symbol.charAt(0).toUpperCase(),
        image: coin.image
      }));
      
      setCryptoData(formattedData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      if (!response.ok) throw new Error('Failed to fetch global data');
      
      const data = await response.json();
      setGlobalStats({
        totalMarketCap: data.data.total_market_cap.usd,
        volume24h: data.data.total_volume.usd,
        btcDominance: data.data.market_cap_percentage.btc,
        ethDominance: data.data.market_cap_percentage.eth
      });
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchGlobalStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return '$0.00';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1) return `$${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    return `$${num.toFixed(6)}`;
  };

  const toggleWatchlist = (id) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(id)) {
      newWatchlist.delete(id);
    } else {
      newWatchlist.add(id);
    }
    setWatchlist(newWatchlist);
  };

  const filteredCoins = cryptoData
    .filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'market_cap') return b.marketCap - a.marketCap;
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'change') return b.change24h - a.change24h;
      return 0;
    });

  const watchlistCoins = cryptoData.filter(coin => watchlist.has(coin.id));

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [coinId, data]) => {
      const coin = cryptoData.find(c => c.id === coinId);
      return total + (coin ? coin.price * data.amount : 0);
    }, 0);
  };

  const calculatePortfolioPnL = () => {
    return Object.entries(portfolio).reduce((total, [coinId, data]) => {
      const coin = cryptoData.find(c => c.id === coinId);
      if (!coin) return total;
      const currentValue = coin.price * data.amount;
      const investedValue = data.buyPrice * data.amount;
      return total + (currentValue - investedValue);
    }, 0);
  };

  const Sparkline = ({ data, positive }) => {
    if (!data || data.length === 0) return null;
    const validData = data.filter(d => d !== null && d !== undefined);
    if (validData.length === 0) return null;

    return (
      <svg width="100" height="40" className="inline-block">
        <polyline
          points={validData.map((val, i) => `${(i / (validData.length - 1)) * 100},${40 - ((val - Math.min(...validData)) / (Math.max(...validData) - Math.min(...validData))) * 35}`).join(' ')}
          fill="none"
          stroke={positive ? '#10b981' : '#ef4444'}
          strokeWidth="2"
        />
      </svg>
    );
  };

  const CoinDetailsModal = ({ coin, onClose }) => {
    const pnl = portfolio[coin.id] ? 
      (coin.price - portfolio[coin.id].buyPrice) * portfolio[coin.id].amount : 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              {coin.image ? (
                <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
              ) : (
                <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center text-white text-2xl font-bold`}>
                  {coin.logo}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{coin.name}</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{coin.symbol}</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Current Price</p>
              <p className="text-3xl font-bold">{formatNumber(coin.price)}</p>
              <p className={`text-sm ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 mt-1`}>
                {coin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(coin.change24h).toFixed(2)}%
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Market Cap</p>
              <p className="text-2xl font-bold">{formatNumber(coin.marketCap)}</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>24h Volume</p>
              <p className="text-2xl font-bold">{formatNumber(coin.volume)}</p>
            </div>
            {portfolio[coin.id] && (
              <div className={`p-4 rounded-xl ${pnl >= 0 ? 'bg-green-500 bg-opacity-10' : 'bg-red-500 bg-opacity-10'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Your P&L</p>
                <p className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatNumber(Math.abs(pnl))}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Holdings: {portfolio[coin.id].amount} {coin.symbol}
                </p>
              </div>
            )}
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className="text-xl font-bold mb-4">Price Chart (Last 7 Days)</h3>
            {coin.sparkline && coin.sparkline.length > 0 ? (
              <div className="h-64 flex items-end gap-1">
                {coin.sparkline.map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${coin.change24h >= 0 ? 'bg-green-500' : 'bg-red-500'} transition-all hover:opacity-80`}
                    style={{ height: `${(val / Math.max(...coin.sparkline)) * 100}%` }}
                  />
                ))}
              </div>
            ) : (
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chart data not available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors`}>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CryptoTracker Live</h1>
                {lastUpdate && (
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search crypto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg w-full md:w-64 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                onClick={() => {
                  fetchCryptoData();
                  fetchGlobalStats();
                }}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && cryptoData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-lg">Loading live crypto data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>Total Market Cap</p>
                </div>
                <p className="text-2xl font-bold">{formatNumber(globalStats.totalMarketCap)}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-100 to-purple-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>24h Volume</p>
                </div>
                <p className="text-2xl font-bold">{formatNumber(globalStats.volume24h)}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-100 to-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" />
                  <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>BTC Dominance</p>
                </div>
                <p className="text-2xl font-bold">{globalStats.btcDominance?.toFixed(1)}%</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-900 to-orange-800' : 'bg-gradient-to-br from-orange-100 to-orange-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5" />
                  <p className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Portfolio Value</p>
                </div>
                <p className="text-2xl font-bold">{formatNumber(calculatePortfolioValue())}</p>
                <p className={`text-sm ${calculatePortfolioPnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {calculatePortfolioPnL() >= 0 ? '+' : ''}{formatNumber(calculatePortfolioPnL())}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['market', 'watchlist', 'portfolio', 'news'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {tab === 'market' && <LineChart className="w-4 h-4 inline mr-2" />}
                  {tab === 'watchlist' && <Star className="w-4 h-4 inline mr-2" />}
                  {tab === 'portfolio' && <Wallet className="w-4 h-4 inline mr-2" />}
                  {tab === 'news' && <Activity className="w-4 h-4 inline mr-2" />}
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'market' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-xl font-bold">All Cryptocurrencies (Live)</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}
                  >
                    <option value="market_cap">Market Cap</option>
                    <option value="price">Price</option>
                    <option value="change">24h Change</option>
                  </select>
                </div>
                
                <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <tr>
                          <th className="px-4 py-3 text-left">Coin</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">24h Change</th>
                          <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
                          <th className="px-4 py-3 text-right hidden lg:table-cell">Volume</th>
                          <th className="px-4 py-3 text-center hidden xl:table-cell">Last 7 Days</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCoins.map((coin) => (
                          <tr 
                            key={coin.id}
                            className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer transition`}
                            onClick={() => setSelectedCoin(coin)}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                {coin.image ? (
                                  <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center text-white font-bold`}>
                                    {coin.logo}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold">{coin.name}</p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{coin.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right font-semibold">{formatNumber(coin.price)}</td>
                            <td className={`px-4 py-4 text-right font-semibold ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              <div className="flex items-center justify-end gap-1">
                                {coin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(coin.change24h).toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">{formatNumber(coin.marketCap)}</td>
                            <td className="px-4 py-4 text-right hidden lg:table-cell">{formatNumber(coin.volume)}</td>
                            <td className="px-4 py-4 text-center hidden xl:table-cell">
                              <Sparkline data={coin.sparkline} positive={coin.change24h >= 0} />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatchlist(coin.id);
                                }}
                                className={`p-2 rounded-lg ${watchlist.has(coin.id) ? 'text-yellow-500' : darkMode ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                              >
                                <Star className={`w-5 h-5 ${watchlist.has(coin.id) ? 'fill-yellow-500' : ''}`} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Your Watchlist</h2>
                {watchlistCoins.length === 0 ? (
                  <div className={`p-12 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No coins in watchlist</p>
                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Add coins to track them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlistCoins.map((coin) => (
                      <div
                        key={coin.id}
                        onClick={() => setSelectedCoin(coin)}
                        className={`p-6 rounded-xl cursor-pointer ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} transition`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {coin.image ? (
                              <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                            ) : (
                              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center text-white text-xl font-bold`}>
                                {coin.logo}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-lg">{coin.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{coin.symbol}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(coin.id);
                            }}
                            className="text-yellow-500"
                          >
                            <Star className="w-5 h-5 fill-yellow-500" />
                          </button>
                        </div>
                        <p className="text-2xl font-bold mb-2">{formatNumber(coin.price)}</p>
                        <p className={`text-sm ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                          {coin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(coin.change24h).toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(portfolio).map(([coinId, data]) => {
                    const coin = cryptoData.find(c => c.id === coinId);
                    if (!coin) return null;
                    const currentValue = coin.price * data.amount;
                    const investedValue = data.buyPrice * data.amount;
                    const pnl = currentValue - investedValue;
                    const pnlPercent = ((pnl / investedValue) * 100).toFixed(2);

                    return (
                      <div
                        key={coinId}
                        className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {coin.image ? (
                              <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                            ) : (
                              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center text-white text-xl font-bold`}>
                                {coin.logo}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-lg">{coin.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.amount} {coin.symbol}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Value</span>
                            <span className="font-semibold">{formatNumber(currentValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Invested</span>
                            <span className="font-semibold">{formatNumber(investedValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Profit/Loss</span>
                            <span className={`font-semibold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {pnl >= 0 ? '+' : ''}{formatNumber(Math.abs(pnl))} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Buy Price</span>
                            <span className="font-semibold">{formatNumber(data.buyPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</span>
                            <span className="font-semibold">{formatNumber(coin.price)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Crypto News</h2>
                <div className="space-y-4">
                  {newsItems.map((news, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} cursor-pointer transition`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{news.title}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                              {news.category}
                            </span>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{news.time}</span>
                          </div>
                        </div>
                        <Eye className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedCoin && (
        <CoinDetailsModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  );
};

export default CryptoDashboard;