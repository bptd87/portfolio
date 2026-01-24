import React from 'react';
import { Search, X } from 'lucide-react';

interface SEOFieldsEditorProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImage: string;
  onChange: (data: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: string;
  }) => void;
}

export function SEOFieldsEditor({
  seoTitle,
  seoDescription,
  seoKeywords,
  ogImage,
  onChange,
}: SEOFieldsEditorProps) {
  const [keywordInput, setKeywordInput] = React.useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !seoKeywords.includes(keywordInput.trim())) {
      onChange({ seoKeywords: [...seoKeywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onChange({ seoKeywords: seoKeywords.filter((k) => k !== keyword) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-accent-brand" />
        <h4 className="tracking-tight">SEO & Social Media</h4>
      </div>

      <div className="bg-accent-brand/5 border border-accent-brand/20 p-4 mb-4">
        <p className="text-xs opacity-80">
          Customize how this project appears in search engines and social media shares. Leave blank to use defaults from project title and description.
        </p>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
          Meta Title (Optional)
        </label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
          placeholder="Leave blank to use project title"
          maxLength={60}
        />
        <p className="text-xs opacity-40 mt-1">
          {seoTitle.length}/60 characters (ideal: 50-60)
        </p>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
          Meta Description (Optional)
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none"
          placeholder="Leave blank to use truncated project description"
          maxLength={160}
        />
        <p className="text-xs opacity-40 mt-1">
          {seoDescription.length}/160 characters (ideal: 150-160)
        </p>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
          Keywords / Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
            placeholder="Add keyword or tag..."
          />
          <button
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-accent-brand text-white hover:opacity-90 transition-opacity"
          >
            <span className="text-xs tracking-wider uppercase">Add</span>
          </button>
        </div>

        {seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {seoKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-accent-brand/10 border border-accent-brand/20 text-sm"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
          Social Media Image (OG Image)
        </label>
        <input
          type="text"
          value={ogImage}
          onChange={(e) => onChange({ ogImage: e.target.value })}
          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
          placeholder="Leave blank to use card image"
        />
        <p className="text-xs opacity-40 mt-1">
          Image shown when sharing on Facebook, Twitter, LinkedIn (ideal: 1200x630px)
        </p>
      </div>
    </div>
  );
}
