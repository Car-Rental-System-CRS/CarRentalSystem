'use client';

import { useState } from 'react';
import FeatureAttachTab from './components/FeatureAttachTab';
import FeatureReplaceTab from './components/FeatureReplaceTab';
import FeatureDetachTab from './components/FeatureDetachTab';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Link, Unlink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type Tab = 'attach' | 'replace' | 'detach';

export default function VehicleFeaturePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('attach');

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Vehicle Features
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage features for this vehicle model
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Feature Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as Tab)}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attach" className="gap-2">
                <Link className="h-4 w-4" />
                Attach
              </TabsTrigger>
              <TabsTrigger value="replace" className="gap-2">
                Replace
              </TabsTrigger>
              <TabsTrigger value="detach" className="gap-2">
                <Unlink className="h-4 w-4" />
                Detach
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attach" className="m-0">
              <FeatureAttachTab />
            </TabsContent>

            <TabsContent value="replace" className="m-0">
              <FeatureReplaceTab />
            </TabsContent>

            <TabsContent value="detach" className="m-0">
              <FeatureDetachTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
