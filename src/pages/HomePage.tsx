import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LineChartIcon, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StockChart } from '@/components/StockChart';
import { StockDataPoint } from '@shared/types';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
export function HomePage() {
  const [ticker, setTicker] = useState('AAPL');
  const [days, setDays] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<StockDataPoint[] | null>(null);
  const handlePredict = useCallback(async () => {
    if (!ticker) {
      toast.error('Please enter a stock ticker.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setChartData(null);
    try {
      const data = await api<StockDataPoint[]>('/api/predict', {
        method: 'POST',
        body: JSON.stringify({
          ticker: ticker,
          days: parseInt(days, 10),
        }),
      });
      setChartData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ticker, days]);
  const ChartState = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-[350px] w-full" />
        </div>
      );
    }
    if (error && !chartData) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Prediction Failed</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      );
    }
    if (chartData) {
      return <StockChart data={chartData} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <TrendingUp className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">Ready to Predict</h3>
        <p className="text-muted-foreground mt-2">Enter a stock ticker and select a timeframe to see the future.</p>
      </div>
    );
  };
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-black dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <header className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
                FinCast
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              A minimalist and visually stunning web interface to predict and visualize future stock prices using an AI-powered API.
            </motion.p>
          </header>
          <main className="mt-12 md:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:col-span-1"
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="w-6 h-6 text-primary" />
                      <span>Prediction Parameters</span>
                    </CardTitle>
                    <CardDescription>
                      Enter a stock ticker and select the prediction timeframe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="ticker">Stock Ticker</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="ticker"
                          placeholder="e.g., AAPL, GOOGL"
                          value={ticker}
                          onChange={(e) => setTicker(e.target.value.toUpperCase())}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="days">Prediction Timeframe</Label>
                      <Select value={days} onValueChange={setDays}>
                        <SelectTrigger id="days">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="14">14 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch space-y-4">
                    <Button onClick={handlePredict} disabled={isLoading} size="lg">
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"
                          />
                          Predicting...
                        </>
                      ) : (
                        'Predict Price'
                      )}
                    </Button>
                     <p className="text-xs text-muted-foreground text-center px-4">
                      Disclaimer: Predictions are for informational purposes only and are not financial advice.
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="lg:col-span-2"
              >
                <Card className="shadow-lg min-h-[485px]">
                  <CardContent className="p-2 sm:p-4">
                    <ChartState />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
          <footer className="text-center mt-16 text-muted-foreground text-sm">
            <p>Built with ❤�� at Cloudflare</p>
          </footer>
        </div>
      </div>
    </div>
  );
}