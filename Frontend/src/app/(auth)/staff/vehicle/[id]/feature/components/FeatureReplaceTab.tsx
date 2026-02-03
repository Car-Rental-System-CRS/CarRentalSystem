'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { featureService } from '@/services/featureService';
import { modelFeatureService } from '@/services/modelFeatureService';
import { CarFeature } from '@/types/feature';
import {
  showLoading,
  dismissToast,
  handleError,
  handleSuccess,
} from '@/lib/errorHandler';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function FeatureReplaceTab() {
  const { id: typeId } = useParams<{ id: string }>();
  const [features, setFeatures] = useState<CarFeature[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  /* ---------- LOAD ALL FEATURES ---------- */
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await featureService.getAll({ page: 0, size: 100 });
        setFeatures(res.data.data.items ?? []);
      } catch (err) {
        handleError(err, 'Failed to load features');
      }
    };

    fetchFeatures();
  }, []);

  /* ---------- FILTER FEATURES ---------- */
  const filteredFeatures = features.filter(
    (feature) =>
      feature.name.toLowerCase().includes(search.toLowerCase()) ||
      feature.description?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- TOGGLE ---------- */
  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ---------- REPLACE ---------- */
  const handleReplace = async () => {
    if (!typeId || selected.length === 0) return;

    const toastId = showLoading('Replacing features...');
    setLoading(true);

    try {
      await modelFeatureService.replace({
        typeId,
        featureIds: selected,
      });

      handleSuccess(
        'Features replaced successfully',
        `${selected.length} feature(s) have been set for this model`
      );

      setSelected([]);
    } catch (err) {
      handleError(err, 'Replace failed');
    } finally {
      dismissToast(toastId);
      setLoading(false);
    }
  };

  const selectAll = () => {
    setSelected(filteredFeatures.map((f) => f.id));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Replace Features</CardTitle>
            <CardDescription>
              Replace all existing features with new selection
            </CardDescription>
          </div>
          {selected.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {selected.length} selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Selection Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={filteredFeatures.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selected.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="grid gap-2 max-h-[400px] overflow-y-auto p-1">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No features found
            </div>
          ) : (
            filteredFeatures.map((feature) => {
              const isSelected = selected.includes(feature.id);

              return (
                <div
                  key={feature.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                    isSelected ? 'bg-warning/5 border-warning' : 'border-border'
                  }`}
                  onClick={() => toggle(feature.id)}
                >
                  <div
                    className={`flex items-center justify-center h-5 w-5 mt-0.5 rounded border ${
                      isSelected
                        ? 'bg-warning border-warning text-warning-foreground'
                        : 'bg-background border-border'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {feature.name}
                      </span>
                    </div>
                    {feature.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <div className="text-sm text-muted-foreground flex-1">
          {selected.length === 0 ? (
            <span>Select features to replace with</span>
          ) : (
            <span className="text-warning font-medium">
              Will replace all existing features with {selected.length} selected
            </span>
          )}
        </div>
        <Button
          onClick={handleReplace}
          disabled={loading || selected.length === 0}
          variant="destructive"
          className="gap-2"
        >
          {loading ? (
            <>Replacing...</>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Replace Features
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
