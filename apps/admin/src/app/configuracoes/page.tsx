import { getSettings } from './actions'
import { SettingsForm } from './settings-form'

export default async function ConfiguracoesPage() {
  const settings = await getSettings()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: '0 0 4px' }}>Configurações</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Dados gerais da loja e parâmetros comerciais</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
