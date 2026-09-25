import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { ModalPerfilUsuario, ModalPerfilMotorista } from '../../components/ui/ModaisPerfil';
import usuariosService from '../../services/usuarios.service';
import motoristasService from '../../services/motoristas.service';
import { User, Search, Filter } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  
  const [modalMotoristaOpen, setModalMotoristaOpen] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);

  // Filters state
  const [filtroPesquisa, setFiltroPesquisa] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await usuariosService.listarTodos({ search: filtroPesquisa, perfil: filtroPerfil });
      setUsuarios(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // Debounce na pesquisa nao é estritamente necessario aqui pois há um botao ou a gente busca on enter/blur.
    // Vamos chamar carregar() toda vez que perfil mudar, e pesquisa só se apertar enter ou botao.
    carregar(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroPerfil]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    carregar();
  };

  const handleSaveUsuario = async (id, dados) => {
    try {
      await usuariosService.atualizar(id, dados);
      await carregar(); // Recarrega a lista com os novos dados
      setUsuarioSelecionado(prev => ({ ...prev, ...dados }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erro ao salvar os dados do usuário.');
    }
  };

  const abrirMotorista = async (usuarioId) => {
    try {
      // O perfil do motorista fica em /api/motoristas/perfil/:usuarioId
      const { data } = await motoristasService.buscarPorUsuarioId(usuarioId);
      if (data) {
        setMotoristaSelecionado(data);
        setModalMotoristaOpen(true);
        setModalUsuarioOpen(false); // fecha o de usuário
      } else {
        alert('Este usuário ainda não possui registro de motorista aprovado/ativo.');
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível carregar o perfil de motorista deste usuário.');
    }
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Usuários" subtitle="Gerencie os usuários cadastrados no sistema" />

      {/* Barra de Ferramentas / Filtros */}
      <div className="tools-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '250px' }}>
          <div className="input-group" style={{ flex: '1', marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Pesquisar por nome ou usuário..." 
                value={filtroPesquisa}
                onChange={e => setFiltroPesquisa(e.target.value)}
                style={{ paddingLeft: '40px', marginBottom: 0 }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>

        <div className="input-group" style={{ marginBottom: 0, minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
            <select 
              className="input-field" 
              value={filtroPerfil} 
              onChange={e => setFiltroPerfil(e.target.value)}
              style={{ paddingLeft: '40px', marginBottom: 0 }}
            >
              <option value="">Todos os perfis</option>
              <option value="USUARIO">Passageiro (USUARIO)</option>
              <option value="MOTORISTA">Motorista</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Carregando usuários..." />
      ) : usuarios.length === 0 ? (
        <EmptyState
          icon={<User size={48} strokeWidth={1.5} />}
          title="Nenhum usuário encontrado"
          description="Não existem usuários correspondentes aos filtros selecionados."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="data-table__row">
                  <td className="data-table__cell">
                    <button 
                      className="btn-link"
                      onClick={() => {
                        setUsuarioSelecionado(u);
                        setModalUsuarioOpen(true);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                    >
                      {u.nome}
                    </button>
                  </td>
                  <td className="data-table__cell">@{u.usuario}</td>
                  <td className="data-table__cell">
                    <Badge 
                      label={u.perfil} 
                      color={u.perfil === 'ADMINISTRADOR' ? 'danger' : u.perfil === 'MOTORISTA' ? 'warning' : 'info'} 
                    />
                  </td>
                  <td className="data-table__cell">{formatarData(u.criadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      <ModalPerfilUsuario
        isOpen={modalUsuarioOpen}
        onClose={() => setModalUsuarioOpen(false)}
        usuario={usuarioSelecionado ? {
          ...usuarioSelecionado,
          onOpenMotorista: () => abrirMotorista(usuarioSelecionado.id)
        } : null}
        onSave={handleSaveUsuario}
      />

      <ModalPerfilMotorista
        isOpen={modalMotoristaOpen}
        onClose={() => setModalMotoristaOpen(false)}
        motorista={motoristaSelecionado}
      />
    </div>
  );
};

export default UsuariosPage;
