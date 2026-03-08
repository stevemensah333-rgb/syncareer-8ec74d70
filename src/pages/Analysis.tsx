import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, GraduationCap, RefreshCw, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useMarketIntelligence } from '@/hooks/useMarketIntelligence';
import { MarketOverviewTab } from '@/components/analysis/MarketOverviewTab';
import { CareerOutlookTab } from '@/components/analysis/CareerOutlookTab';

const Analysis = () => {
  const { studentDetails, loading: profileLoading } = useUserProfile();
  const major = studentDetails?.major;

  const { data, loading, error, refresh } = useMarketIntelligence(major);

  if (profileLoading) {
    return (
      <PageLayout title="Market Analysis">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!major) {
    return (
      <PageLayout title="Market Analysis">
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h3 className="font-semibold">No Academic Profile Found</h3>
            <p className="text-sm text-muted-foreground">
              Complete your onboarding with your major and degree details to unlock personalised market intelligence.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Market Analysis">
      <div className="space-y-6">
        {/* Intelligence Header */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">AI-Powered Career Market Intelligence</h3>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <GraduationCap className="h-2.5 w-2.5" />
                      {major}
                    </Badge>
                    {data && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-primary/30 text-primary"
                      >
                        {data.from_cache ? "Cached" : "Fresh"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Real-time skill demand, salary benchmarks, and hiring forecasts — personalised to your field.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="gap-1.5 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/30">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Failed to load market intelligence</p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={refresh} className="ml-auto">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className={i < 3 ? "" : "lg:col-span-1"}>
                  <CardContent className="pt-5 pb-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-1.5 bg-muted rounded-full w-4/5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="pt-5 pb-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-64 bg-muted rounded" />
              </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground">
              Analysing job market data for {major}…
            </p>
          </div>
        )}

        {/* Main Content */}
        {data && !loading && (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Market Overview
              </TabsTrigger>
              <TabsTrigger value="outlook" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Career Outlook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <MarketOverviewTab data={data} />
            </TabsContent>

            <TabsContent value="outlook">
              <CareerOutlookTab data={data} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default Analysis;
