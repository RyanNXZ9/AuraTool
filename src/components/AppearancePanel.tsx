import { React, useRef, useState } from '@webpack/common';

import { imageSource } from '../profileAppearance';
import { DEFAULT_APPEARANCE, type ProfileAppearance } from '../types';

const mediaFields = [
  ['avatar', 'Avatar estático ou GIF'],
  ['decoration', 'Moldura do avatar'],
  ['banner', 'Banner do perfil'],
  ['effect', 'Efeito sobre o perfil'],
] as const;

export default function AppearancePanel({ value, apply }: {
  value?: ProfileAppearance;
  apply: (value: ProfileAppearance) => void;
}) {
  const [draft, setDraft] = useState({ ...DEFAULT_APPEARANCE, ...value });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileVersion = useRef(0);

  return (
    <div className="cbp-panel">
      <h3 className="cbp-section-title">Aparência do perfil</h3>
      <p className="cbp-section-desc">Personalize seu perfil neste cliente. Para mídia externa que não carregar, selecione o arquivo no painel.</p>
      <div className="cbp-modal-actions aura-appearance-actions">
        {message && <span role="status">{message}</span>}
        <button type="button" className="cbp-btn" disabled={loading} onClick={() => {
          setDraft({ ...DEFAULT_APPEARANCE });
          apply({ ...DEFAULT_APPEARANCE });
          setMessage('Aparência restaurada.');
        }}>Restaurar</button>
        <button type="button" className="cbp-btn cbp-btn-primary" disabled={loading} onClick={() => {
          const next = { ...draft };
          for (const [key, label] of mediaFields) {
            if (next[key] && !imageSource(next[key])) {
              setMessage(`${label}: informe uma URL HTTPS ou selecione um arquivo.`);
              return;
            }
            next[key] = imageSource(next[key]);
          }
          apply(next);
          setMessage('Aparência aplicada.');
        }}>Aplicar</button>
      </div>
      <div className="aura-preview" style={{ background: `linear-gradient(125deg, ${draft.primaryColor || '#23252d'}, ${draft.accentColor || '#3c4062'})` }}>
        {imageSource(draft.banner) && <img className="aura-preview-banner" src={imageSource(draft.banner)} alt="" />}
        <span className="aura-preview-avatar">
          {imageSource(draft.avatar) && <img src={imageSource(draft.avatar)} alt="Avatar" />}
          {imageSource(draft.decoration) && <img className="aura-preview-decoration" src={imageSource(draft.decoration)} alt="" />}
        </span>
        {imageSource(draft.effect) && <img className="aura-preview-effect" src={imageSource(draft.effect)} alt="" />}
      </div>

      {mediaFields.map(([key, label]) => (
        <div className="cbp-form-group" key={key}>
          <label htmlFor={`aura-${key}`}>{label}</label>
          <div className="aura-media-input">
            <input id={`aura-${key}`} className="cbp-input" value={draft[key].startsWith('data:') ? '' : draft[key]}
              placeholder={draft[key].startsWith('data:') ? 'Imagem de arquivo selecionada' : 'https://…'}
              onChange={e => setDraft(previous => ({ ...previous, [key]: e.target.value }))} />
            <button type="button" className="cbp-btn" disabled={!draft[key]} onClick={() => setDraft(previous => ({ ...previous, [key]: '' }))}>Limpar</button>
          </div>
          <input aria-label={`Arquivo para ${label}`} type="file" accept="image/gif,image/png,image/jpeg,image/webp,image/avif"
            onChange={event => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              if (!/^image\/(gif|png|jpeg|webp|avif)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
                setMessage('Use GIF, PNG, JPEG, WebP ou AVIF de até 2 MiB.');
                return;
              }
              const version = ++fileVersion.current;
              const reader = new FileReader();
              setLoading(true);
              reader.onloadend = () => {
                if (version !== fileVersion.current) return;
                setLoading(false);
                if (typeof reader.result !== 'string' || !imageSource(reader.result)) {
                  setMessage('Não foi possível ler a imagem.');
                  return;
                }
                setDraft(previous => ({ ...previous, [key]: reader.result as string }));
                setMessage('');
              };
              reader.readAsDataURL(file);
            }} />
        </div>
      ))}
      <div className="cbp-form-row">
        <label className="cbp-label">Cor primária <input type="color" value={draft.primaryColor || '#23252d'} onChange={e => setDraft({ ...draft, primaryColor: e.target.value, accentColor: draft.accentColor || '#3c4062' })} /></label>
        <label className="cbp-label">Cor de destaque <input type="color" value={draft.accentColor || '#3c4062'} onChange={e => setDraft({ ...draft, accentColor: e.target.value, primaryColor: draft.primaryColor || '#23252d' })} /></label>
      </div>

    </div>
  );
}

