import { ImageUploader } from './ImageUploader';
import { Trash2, MoveUp, MoveDown } from 'lucide-react';


interface SimpleGalleryEditorProps {
    images: string[];
    captions: string[];
    onChange: (images: string[], captions: string[]) => void;
    label?: string;
    captionPlaceholder?: string;
}

export function SimpleGalleryEditor({
    images = [],
    captions = [],
    onChange,
    label = "Gallery Images",
    captionPlaceholder = "Enter caption (production name, location, team, etc.)"
}: SimpleGalleryEditorProps) {

    const handleImageAdd = (url: string) => {
        onChange([...images, url], [...captions, '']);
    };

    const handleImageRemove = (index: number) => {
        onChange(
            images.filter((_, i) => i !== index),
            captions.filter((_, i) => i !== index)
        );
    };

    const handleCaptionChange = (index: number, value: string) => {
        const newCaptions = [...captions];
        newCaptions[index] = value;
        onChange(images, newCaptions);
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        const newCaptions = [...captions];

        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
        [newCaptions[index], newCaptions[index - 1]] = [newCaptions[index - 1], newCaptions[index]];

        onChange(newImages, newCaptions);
    };

    const handleMoveDown = (index: number) => {
        if (index === images.length - 1) return;
        const newImages = [...images];
        const newCaptions = [...captions];

        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        [newCaptions[index], newCaptions[index + 1]] = [newCaptions[index + 1], newCaptions[index]];

        onChange(newImages, newCaptions);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground">{label}</h3>
                <span className="text-xs text-muted-foreground">{images.length} {images.length === 1 ? 'image' : 'images'}</span>
            </div>

            {/* Image Upload */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <ImageUploader
                    label="Add Images"
                    value=""
                    onChange={handleImageAdd}
                    bucketName="projects"
                />
            </div>

            {/* Existing Images */}
            {images.length > 0 && (
                <div className="space-y-4">
                    {images.map((image, index) => (
                        <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
                                {/* Image Preview */}
                                <div className="relative aspect-video lg:aspect-square bg-muted">
                                    <img
                                        src={image}
                                        alt={`Gallery image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Caption and Controls */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-pixel tracking-[0.3em] text-muted-foreground">IMAGE {index + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <MoveUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === images.length - 1}
                                                className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <MoveDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
                                                className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                                                title="Remove image"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={captions[index] || ''}
                                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                                        placeholder={captionPlaceholder}
                                        rows={4}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent-brand transition-colors resize-none text-sm"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        {captions[index]?.split('\n').length || 0} lines
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/20">
                    <p className="text-sm text-muted-foreground">No images added yet. Upload your first image above.</p>
                </div>
            )}
        </div>
    );
}
