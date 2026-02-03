import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { useLanguage } from '../contexts/LanguageContext';

interface StoryEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ value, onChange, readOnly = false }) => {
    const { t } = useLanguage();
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    return (
        <div className="story-editor-container card">
            <h3 style={{ marginBottom: '1rem' }}>{t('patientStory')}</h3>
            <div className="editor-wrapper">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    modules={readOnly ? { toolbar: false } : modules}
                    formats={formats}
                    style={{ height: '300px', display: 'flex', flexDirection: 'column' }}
                    className="premium-editor"
                />
            </div>
            {/* Spacer for toolbar height adjustment */}
            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default StoryEditor;
