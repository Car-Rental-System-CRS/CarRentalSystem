'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
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

export default function FeatureAttachTab() {
  const { id: typeId } = useParams<{ id: string }>();
  const [features, setFeatures] = useState<CarFeature[]>([]);
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!typeId) return;

    const fetchData = async () => {
      try {
        const [allRes, attachedRes] = await Promise.all([
          featureService.getAll({ page: 0, size: 100 }),
          modelFeatureService.getByType(typeId, { page: 0, size: 100 }),
        ]);

        const allFeatures = allRes.data.data.items ?? [];
        const attached =
          (attachedRes.data.data.content as AttachedFeature[]) ?? [];
        const attachedFeatureIds = attached.map((f) => f.featureId);

        setFeatures(allFeatures);
        setAttachedIds(attachedFeatureIds);
        setSelected(attachedFeatureIds);
      } catch (err) {
        handleError(err, 'Failed to load features');
      }
    };

    fetchData();
  }, [typeId]);

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

  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    if (!typeId) return;
    const toAttach = selected.filter((id) => !attachedIds.includes(id));

    if (toAttach.length === 0) {
      handleSuccess('All selected features are already attached');
      return;
    }

    const toastId = showLoading('Attaching features...');
    setLoading(true);

    try {
      await modelFeatureService.attachBulk({
        typeId,
        featureIds: toAttach,
      });

      handleSuccess(`${toAttach.length} feature(s) attached successfully`);
      setAttachedIds((prev) => [...prev, ...toAttach]);
      setSelected((prev) => [...prev]); // Keep selection
    } catch (err) {
      handleError(err, 'Attach failed');
    } finally {
      dismissToast(toastId);
      setLoading(false);
    }
  };

  const newSelectedCount = selected.filter(
    (id) => !attachedIds.includes(id)
  ).length;
  const attachedCount = attachedIds.length;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Attach Features</CardTitle>
            <CardDescription>
              Select features to add to this vehicle model
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {attachedCount} attached
            </Badge>
            {newSelectedCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                +{newSelectedCount} new
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Features List */}
        <div className="grid gap-2 max-h-[400px] overflow-y-auto p-1">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No features found
            </div>
          ) : (
            filteredFeatures.map((feature) => {
              const isAttached = attachedIds.includes(feature.id);
              const isSelected = selected.includes(feature.id);

              return (
                <div
                  key={feature.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                    isSelected ? 'bg-primary/5 border-primary' : 'border-border'
                  } ${isAttached ? 'opacity-75' : ''}`}
                  onClick={() => !isAttached && toggle(feature.id)}
                >
                  <div
                    className={`flex items-center justify-center h-5 w-5 mt-0.5 rounded border ${
                      isAttached
                        ? 'bg-muted border-muted-foreground/30'
                        : isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border'
                    }`}
                  >
                    {isAttached ? (
                      <Check className="h-3 w-3" />
                    ) : isSelected ? (
                      <Check className="h-3 w-3" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {feature.name}
                      </span>
                      {isAttached && (
                        <Badge variant="outline" className="text-xs">
                          Attached
                        </Badge>
                      )}
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
          {newSelectedCount === 0 ? (
            <span>Select features to attach</span>
          ) : (
            <span>{newSelectedCount} feature(s) selected for attachment</span>
          )}
        </div>
        <Button
          onClick={submit}
          disabled={loading || newSelectedCount === 0}
          className="gap-2"
        >
          {loading ? (
            <>Attaching...</>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Attach {newSelectedCount > 0 ? `(${newSelectedCount})` : ''}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
