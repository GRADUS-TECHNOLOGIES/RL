import {
    BsTypeBold,
    BsTypeItalic,
    BsTypeUnderline,
    BsListUl,
    BsListOl,
    BsLink45Deg,
    BsTypeH1,
    BsTypeH2,
    BsTypeH3,
} from 'react-icons/bs';

export default function EditorToolbar({ editor }) {
    if (!editor) return null;

    const applyIfSelection = (callback) => {
        if (editor.state.selection.empty) {
            alert('Selecciona el texto que deseas formatear');
            return;
        }
        callback();
    };

    return (
        <div
            className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-white dark:bg-gray-800 sticky z-10 mt-1"
            style={{ top: '90px' }}
        >

            {/* Bold */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Negrita"
            >
                <BsTypeBold size={20} />
            </button>

            {/* Italic */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Cursiva"
            >
                <BsTypeItalic size={20} />
            </button>

            {/* Underline */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Subrayado"
            >
                <BsTypeUnderline size={20} />
            </button>

            {/* Headings */}
            <div className='border-l pl-2 ml-2 border-gray-300 flex items-center'>
                {[1, 2, 3].map((level) => (
                    <button
                        key={level}
                        type='button'
                        onClick={() => applyIfSelection(() => editor.chain().focus().toggleHeading({ level }).run())}
                        className={`p-2 rounded ml-1 ${editor.isActive('heading', { level })
                            ? 'bg-purple-200 text-[#b076ce]'
                            : 'hover:bg-gray-200'
                            }`}
                        title={`Heading ${level}`}
                    >
                        {level === 1 ? <BsTypeH1 size={20} /> : level === 2 ? <BsTypeH2 size={20} /> : <BsTypeH3 size={20} />}
                    </button>
                ))}
            </div>

            {/* Font Size 
            <select
                onChange={(e) => editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()}
                value={editor.getAttributes('textStyle').fontSize || ''}
                className="border rounded px-2 py-1 text-sm"
                title="Tamaño de fuente"
            >
                <option value="">Tamaño</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="20px">20</option>
                <option value="24px">24</option>
                <option value="32px">32</option>
            </select>
            */}

            {/* Text Color */}
            <input
                type="color"
                onInput={(e) => editor.chain().focus().setMark('textStyle', { color: e.target.value }).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="h-7 w-7 p-0 border-none cursor-pointer"
                title="Color del texto"
            />

            {/* Bullet List */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Lista de viñetas"
            >
                <BsListUl size={20} />
            </button>

            {/* Ordered List */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Lista numerada"
            >
                <BsListOl size={20} />
            </button>

            {/* Text Align */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Alinear izquierda"
            >
                👈
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Centrar texto"
            >
                🔲
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Alinear derecha"
            >
                👉
            </button>

            {/* Blockquote */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Cita"
            >
                “ ”
            </button>

            {/* Insert Table */}
            <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()}
                className="p-2 rounded hover:bg-gray-200"
                title="Insertar tabla"
            >
                Tabla
            </button>

            {/* Insert Emoji */}
            <button
                type="button"
                onClick={() => editor.chain().focus().insertContent('🙂').run()}
                className="p-2 rounded hover:bg-gray-200"
                title="Insertar emoji"
            >
                😊
            </button>

            {/* Link */}
            <button
                type="button"
                onClick={() => {
                    const url = prompt('Introduce la URL:');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                className={editor.isActive('link') ? 'bg-purple-200 text-[#b076ce] p-2 rounded' : 'p-2 rounded hover:bg-gray-200'}
                title="Insertar enlace"
            >
                <BsLink45Deg size={20} />
            </button>
        </div>
    );
}