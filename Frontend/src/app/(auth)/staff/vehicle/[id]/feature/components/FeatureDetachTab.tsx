'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Trash2, AlertTriangle } from 'lucide-react';
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

type AttachedFeature = {
  featureId: string;
};

export default function FeatureDetachTab() {
  const { id: typeId } = useParams<{ id: string }>();
  const [attached, setAttached] = useState<AttachedFeature[]>([]);
  const [allFeatures, setAllFeatures] = useState<CarFeature[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!typeId) return;

    const fetchData = async () => {
      try {
        const [attachedRes, allRes] = await Promise.all([
          modelFeatureService.getByType(typeId, { page: 0, size: 100 }),
          featureService.getAll({ page: 0, size: 100 }),
        ]);

        setAttached(attachedRes.data.data.content ?? []);
        setAllFeatures(allRes.data.data.items ?? []);
      } catch (err) {
        handleError(err, 'Failed to load features');
      }
    };

    fetchData();
  }, [typeId]);

  /* ---------- HELPERS ---------- */
  const getFeatureById = (id: string) => allFeatures.find((f) => f.id === id);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredFeatures = attached.filter((item) => {
    const feature = getFeatureById(item.featureId);
    return (
      feature?.name.toLowerCase().includes(search.toLowerCase()) ||
      feature?.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ---------- DETACH ---------- */
  const handleDetach = async () => {
    if (!typeId || selected.length === 0) return;

    const toastId = showLoading('Detaching features...');
    setLoading(true);

    try {
      await modelFeatureService.detachBulk({
        typeId,
        featureIds: selected,
      });

      handleSuccess(`${selected.length} feature(s) detached successfully`);
      setAttached((prev) =>
        prev.filter((f) => !selected.includes(f.featureId))
      );
      setSelected([]);
    } catch (err) {
      handleError(err, 'Detach failed');
    } finally {
      dismissToast(toastId);
      setLoading(false);
    }
  };

  const selectAll = () => {
    setSelected(filteredFeatures.map((f) => f.featureId));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Detach Features</CardTitle>
            <CardDescription>
              Remove features from this vehicle model
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {attached.length} attached
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Selection Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search attached features..."
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
              {attached.length === 0
                ? 'No features are attached to this model'
                : 'No matching features found'}
            </div>
          ) : (
            filteredFeatures.map((item) => {
              const feature = getFeatureById(item.featureId);
              const isSelected = selected.includes(item.featureId);

              if (!feature) return null;

              return (
                <div
                  key={item.featureId}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                    isSelected
                      ? 'bg-destructive/5 border-destructive'
                      : 'border-border'
                  }`}
                  onClick={() => toggle(item.featureId)}
                >
                  <div
                    className={`flex items-center justify-center h-5 w-5 mt-0.5 rounded border ${
                      isSelected
                        ? 'bg-destructive border-destructive text-destructive-foreground'
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
                      <Badge variant="secondary" className="text-xs">
                        Attached
                      </Badge>
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
            <span>Select features to detach</span>
          ) : (
            <span className="text-destructive font-medium">
              {selected.length} feature(s) selected for removal
            </span>
          )}
        </div>
        <Button
          onClick={handleDetach}
          disabled={loading || selected.length === 0}
          variant="destructive"
          className="gap-2"
        >
          {loading ? (
            <>Detaching...</>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Detach {selected.length > 0 ? `(${selected.length})` : ''}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
