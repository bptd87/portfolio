
interface ModernArticleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ModernArticleEditor({ value, onChange, placeholder = 'Start writing...' }: ModernArticleEditorProps) {
  console.log('🎨 ModernArticleEditor RENDERING (minimal version)');
  
  return (
    <div className="border border-blue-500 rounded-lg overflow-hidden bg-zinc-900">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700">
        <h3 className="text-white text-sm font-medium">Modern Article Editor (Minimal Test)</h3>
      </div>
      <div className="p-6">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 bg-zinc-900 text-white p-4 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-zinc-500 mt-2">
          This is a minimal test version. If this works, the issue is with TipTap dependencies.
        </p>
      </div>
    </div>
  );
}

export { ModernArticleEditor };
export default ModernArticleEditor;
