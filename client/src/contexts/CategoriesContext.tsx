import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Discipline {
  id: number;
  nome: string;
}

interface Subject {
  id: number;
  nome: string;
  disciplina_id: number;
}

interface Banca {
  id: number;
  nome: string;
}

interface Orgao {
  id: number;
  nome: string;
}

interface Escolaridade {
  id: number;
  nivel: string;
}

interface Ano {
  id: number;
  ano: number;
}

interface CategoriesContextType {
  disciplines: Discipline[];
  subjects: Subject[];
  bancas: Banca[];
  orgaos: Orgao[];
  escolaridades: Escolaridade[];
  anos: Ano[];
  loading: boolean;
  reloadCategories: () => Promise<void>;
  lastUpdate: Date | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider: React.FC<CategoriesProviderProps> = ({ children }) => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [escolaridades, setEscolaridades] = useState<Escolaridade[]>([]);
  const [anos, setAnos] = useState<Ano[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('Carregando categorias...');

      const [
        disciplinesResult,
        subjectsResult,
        bancasResult,
        orgaosResult,
        escolaridadesResult,
        anosResult
      ] = await Promise.all([
        supabase.from('disciplinas').select('*').order('nome'),
        supabase.from('assuntos').select('*').order('nome'),
        supabase.from('bancas').select('*').order('nome'),
        supabase.from('orgaos').select('*').order('nome'),
        supabase.from('escolaridades').select('*').order('nivel'),
        supabase.from('anos').select('*').order('ano', { ascending: false })
      ]);

      if (disciplinesResult.error) throw disciplinesResult.error;
      if (subjectsResult.error) throw subjectsResult.error;
      if (bancasResult.error) throw bancasResult.error;
      if (orgaosResult.error) throw orgaosResult.error;
      if (escolaridadesResult.error) throw escolaridadesResult.error;
      if (anosResult.error) throw anosResult.error;

      setDisciplines(disciplinesResult.data || []);
      setSubjects(subjectsResult.data || []);
      setBancas(bancasResult.data || []);
      setOrgaos(orgaosResult.data || []);
      setEscolaridades(escolaridadesResult.data || []);
      setAnos(anosResult.data || []);
      setLastUpdate(new Date());

      console.log('Categorias carregadas:', {
        disciplinas: disciplinesResult.data?.length,
        assuntos: subjectsResult.data?.length,
        bancas: bancasResult.data?.length,
        orgaos: orgaosResult.data?.length,
        escolaridades: escolaridadesResult.data?.length,
        anos: anosResult.data?.length
      });
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const reloadCategories = async () => {
    await loadCategories();
  };

  useEffect(() => {
    loadCategories();

    // Recarregar categorias a cada 30 segundos para manter sincronizado
    const interval = setInterval(() => {
      loadCategories();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: CategoriesContextType = {
    disciplines,
    subjects,
    bancas,
    orgaos,
    escolaridades,
    anos,
    loading,
    reloadCategories,
    lastUpdate
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
