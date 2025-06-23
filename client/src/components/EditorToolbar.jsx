import React from 'react';
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

    // Validación de selección antes de aplicar cualquier estilo
    const applyIfSelection = (callback) => {
        if (editor.state.selection.empty) {
            alert('Selecciona el texto que deseas formatear');
            return;
        }
        callback();
    };

    return (
        <div className='toolbar flex flex-wrap gap-2 mb-2 border-b pb-2'>
            {/* Bold */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Bold"
            >
                <BsTypeBold size={20} />
            </button>

            {/* Italic */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Italic"
            >
                <BsTypeItalic size={20} />
            </button>

            {/* Underline */}
            <button
                type='button'
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Underline"
            >
                <BsTypeUnderline size={20} />
            </button>

            {/* Headings */}
            <div className='border-l pl-2 ml-2 border-gray-300 flex items-center'>
                <span className='text-sm font-medium mr-2'>Headings:</span>
                {[1, 2, 3].map((level) => (
                    <button
                        key={level}
                        type='button'
                        onClick={() =>
                            applyIfSelection(() =>
                                editor.chain().focus().toggleHeading({ level }).run()
                            )
                        }
                        className={`ml-2 p-2 rounded ${
                            editor.isActive('heading', { level })
                                ? 'bg-blue-100'
                                : 'hover:bg-gray-100'
                        }`}
                        title={`Heading ${level}`}
                    >
                        {level === 1 ? (
                            <BsTypeH1 size={20} />
                        ) : level === 2 ? (
                            <BsTypeH2 size={20} />
                        ) : (
                            <BsTypeH3 size={20} />
                        )}
                    </button>
                ))}
            </div>

            {/* Bullet List */}
            <button
                type='button'
                onClick={() =>
                    applyIfSelection(() =>
                        editor.chain().focus().toggleBulletList().run()
                    )
                }
                className={editor.isActive('bulletList') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Bullet List"
            >
                <BsListUl size={20} />
            </button>

            {/* Ordered List */}
            <button
                type='button'
                onClick={() =>
                    applyIfSelection(() =>
                        editor.chain().focus().toggleOrderedList().run()
                    )
                }
                className={editor.isActive('orderedList') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Numbered List"
            >
                <BsListOl size={20} />
            </button>

            {/* Link */}
            <button
                type='button'
                onClick={() => {
                    const url = prompt('Enter the URL:');
                    if (url)
                        editor.chain().focus().setLink({ href: url }).run();
                }}
                className={editor.isActive('link') ? 'bg-blue-100 p-2 rounded' : 'p-2 rounded hover:bg-gray-100'}
                title="Add Link"
            >
                <BsLink45Deg size={20} />
            </button>
        </div>
    );
}