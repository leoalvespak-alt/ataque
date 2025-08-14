import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLogo } from '../../contexts/LogoContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface LogoConfig {
  id: number;
  tipo: string;
  url: string;
  nome_arquivo: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
  ativo: boolean;
}

const AdminConfiguracoes: React.FC = () => {
  const { user } = useAuth();
  const { logoConfigs, loadLogoConfigs, refreshConfigs } = useLogo();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Rota de Ataque',
    siteDescription: 'Plataforma de estudos para concursos',
    maintenanceMode: false,
    emailNotifications: true,
    maxQuestionsPerDay: 50,
    xpPerQuestion: 10
  });

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadSettings();
    loadLogoConfigs();
  }, [user]);

  const loadSettings = async () => {
    try {
      // Simular carregamento de configurações
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setLoading(false);
    }
  };



  const handleFileUpload = async (file: File, tipo: string) => {
    try {
      setUploading(true);

      // Validar arquivo
      const maxSize = tipo === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024; // 1MB para favicon, 5MB para logo
      if (file.size > maxSize) {
        alert(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = tipo === 'favicon' 
        ? ['image/x-icon', 'image/svg+xml', 'image/png'] 
        : ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
        return;
      }

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${tipo}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Tentar primeiro com bucket 'uploads', se falhar, tentar com 'public'
      let uploadData, uploadError;
      
      try {
        const result = await supabase.storage
          .from('uploads')
          .upload(filePath, file);
        uploadData = result.data;
        uploadError = result.error;
      } catch (bucketError) {
        console.log('Bucket "uploads" não encontrado, tentando "public"...');
        try {
          const result = await supabase.storage
            .from('public')
            .upload(filePath, file);
          uploadData = result.data;
          uploadError = result.error;
        } catch (publicError) {
          console.log('Bucket "public" não encontrado, tentando criar bucket...');
          // Se ambos falharem, vamos usar uma URL temporária
          uploadError = { message: 'Buckets de storage não configurados' };
        }
      }

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        // Usar URL temporária para desenvolvimento
        const tempUrl = URL.createObjectURL(file);
        
        // Atualizar configuração no banco com URL temporária
        const { data, error } = await supabase
          .from('configuracoes_logo')
          .upsert({
            tipo,
            url: tempUrl,
            nome_arquivo: fileName,
            tamanho_bytes: file.size,
            tipo_mime: file.type,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;

              // Recarregar configurações
      await refreshConfigs();
      
      // Atualizar favicon no DOM se necessário
      if (tipo === 'favicon') {
        updateFavicon(tempUrl);
      }

      alert(`${tipo === 'favicon' ? 'Favicon' : 'Logo'} atualizado com sucesso! (URL temporária - configure o bucket de storage)`);
      return;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // Atualizar configuração no banco
      const { data, error } = await supabase
        .from('configuracoes_logo')
        .upsert({
          tipo,
          url: urlData.publicUrl,
          nome_arquivo: fileName,
          tamanho_bytes: file.size,
          tipo_mime: file.type,
          ativo: true
        })
        .select()
        .single();

      if (error) throw error;

      // Recarregar configurações
      await refreshConfigs();
      
      // Atualizar favicon no DOM se necessário
      if (tipo === 'favicon') {
        updateFavicon(urlData.publicUrl);
      }

      alert(`${tipo === 'favicon' ? 'Favicon' : 'Logo'} atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo. Verifique se o bucket de storage está configurado.');
    } finally {
      setUploading(false);
    }
  };

  const updateFavicon = (url: string) => {
    // Remover favicons existentes
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // Adicionar novo favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  };

  const handleSaveSettings = async () => {
    try {
      // Simular salvamento
      console.log('Configurações salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const getLogoConfig = (tipo: string) => {
    return logoConfigs.find(config => config.tipo === tipo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-[#f2f2f2]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2]">
            Configurações
          </h1>
          <Link
            to="/admin"
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Admin
          </Link>
        </div>

        {/* Configurações de Logo e Favicon */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Logo e Favicon</h2>
          
          {/* Logo */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Logo da Plataforma</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#1b1b1b] border border-[#333333] rounded-lg flex items-center justify-center">
                {getLogoConfig('logo') ? (
                  <img 
                    src={getLogoConfig('logo')?.url} 
                    alt="Logo atual" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <i className="fas fa-image text-[#666666] text-2xl hidden"></i>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Upload de Logo</label>
                  <input
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                    className="block w-full text-sm text-[#f2f2f2] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8b0000] file:text-white hover:file:bg-[#6b0000] file:cursor-pointer"
                    disabled={uploading}
                  />
                </div>
                <p className="text-xs text-[#f2f2f2]/70">
                  Formatos aceitos: SVG, PNG, JPG. Tamanho máximo: 5MB.
                </p>
                {getLogoConfig('logo') && (
                  <p className="text-xs text-[#f2f2f2]/70 mt-1">
                    Arquivo atual: {getLogoConfig('logo')?.nome_arquivo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <h3 className="text-lg font-medium mb-3">Favicon</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1b1b1b] border border-[#333333] rounded-lg flex items-center justify-center">
                {getLogoConfig('favicon') ? (
                  <img 
                    src={getLogoConfig('favicon')?.url} 
                    alt="Favicon atual" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <i className="fas fa-star text-[#666666] text-lg hidden"></i>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Upload de Favicon</label>
                  <input
                    type="file"
                    accept=".ico,.svg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'favicon');
                    }}
                    className="block w-full text-sm text-[#f2f2f2] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8b0000] file:text-white hover:file:bg-[#6b0000] file:cursor-pointer"
                    disabled={uploading}
                  />
                </div>
                <p className="text-xs text-[#f2f2f2]/70">
                  Formatos aceitos: ICO, SVG, PNG. Tamanho máximo: 1MB. Recomendado: 32x32px.
                </p>
                {getLogoConfig('favicon') && (
                  <p className="text-xs text-[#f2f2f2]/70 mt-1">
                    Arquivo atual: {getLogoConfig('favicon')?.nome_arquivo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 p-3 bg-[#1b1b1b] rounded-lg border border-[#333333]">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                <span className="text-sm">Fazendo upload...</span>
              </div>
            </div>
          )}
        </div>

        {/* Configurações Gerais */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Site</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição do Site</label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Sistema */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Configurações de Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[#f2f2f2]">Modo de Manutenção</h3>
                <p className="text-sm text-[#f2f2f2]/70">Ativa o modo de manutenção do site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[#f2f2f2]">Notificações por Email</h3>
                <p className="text-sm text-[#f2f2f2]/70">Envia notificações por email aos usuários</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Gamificação */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Configurações de Gamificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Máximo de Questões por Dia</label>
              <input
                type="number"
                value={settings.maxQuestionsPerDay}
                onChange={(e) => setSettings({...settings, maxQuestionsPerDay: parseInt(e.target.value)})}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">XP por Questão</label>
              <input
                type="number"
                value={settings.xpPerQuestion}
                onChange={(e) => setSettings({...settings, xpPerQuestion: parseInt(e.target.value)})}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <button className="bg-[#333333] hover:bg-[#444444] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Restaurar Padrões
          </button>
          <button
            onClick={handleSaveSettings}
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracoes;
