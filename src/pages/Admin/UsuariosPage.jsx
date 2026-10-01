import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { ModalPerfilUsuario, ModalPerfilMotorista, ModalPerfilVeiculo } from '../../components/ui/ModaisPerfil';
import ModalErro from '../../components/ui/ModalErro';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import FormularioDadosPessoais from '../../components/ui/FormularioDadosPessoais';
import usuariosService from '../../services/usuarios.service';
import motoristasService from '../../services/motoristas.service';
import veiculosService from '../../services/veiculos.service';
import { User, Search, Filter, Plus, Car, Shield } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  
  const [modalMotoristaOpen, setModalMotoristaOpen] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);

  const [modalVeiculoOpen, setModalVeiculoOpen] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });

  // Criar usuario state
  const [modalEscolhaOpen, setModalEscolhaOpen] = useState(false);
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState('');
  const [etapaCadastro, setEtapaCadastro] = useState(1);
  const defaultForm = {
    nome: '', cpf: '', celular: '', email: '',
    endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' },
    senha: '', senhaConfirmacao: '', cnh: '',
  };
  const [formCadastro, setFormCadastro] = useState(defaultForm);
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

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
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao salvar os dados do usuário.',
      });
    }
  };

  const handleSaveMotorista = async (id, dados) => {
    try {
      await motoristasService.atualizar(id, dados);
      await carregar();
      setMotoristaSelecionado(prev => ({ ...prev, ...dados, usuario: { ...prev.usuario, nome: dados.nome, usuario: dados.usuario, cpf: dados.cpf, email: dados.email, celular: dados.celular, endereco: dados.endereco }, cnh: dados.cnh }));
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao salvar os dados do motorista.',
      });
    }
  };

  const handleSaveVeiculo = async (id, dados) => {
    try {
      await veiculosService.atualizar(id, dados);
      await carregar();
      setVeiculoSelecionado(prev => ({ ...prev, ...dados }));
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao salvar os dados do veículo.',
      });
    }
  };

  const abrirMotorista = async (usuarioId) => {
    try {
      // O perfil do motorista fica em /api/motoristas/perfil/:usuarioId
      const motorista = await motoristasService.buscarPorUsuarioId(usuarioId);
      if (motorista) {
        setMotoristaSelecionado(motorista);
        setModalMotoristaOpen(true);
        setModalUsuarioOpen(false); // fecha o de usuário
      } else {
        setErroModal({
          aberto: true,
          titulo: 'Aviso',
          mensagem: 'Este usuário ainda não possui registro de motorista aprovado/ativo.',
        });
      }
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: 'Não foi possível carregar o perfil de motorista deste usuário.',
      });
    }
  };

  const isFormDirty = () => JSON.stringify(formCadastro) !== JSON.stringify(defaultForm);

  const handleOpenCadastro = (perfil) => {
    setPerfilSelecionado(perfil);
    setModalEscolhaOpen(false);
    setFormCadastro(defaultForm);
    setEtapaCadastro(1);
    setModalCadastroOpen(true);
  };

  const handleCloseCadastroRequest = () => {
    if (isFormDirty()) {
      setShowConfirmCancel(true);
    } else {
      setModalCadastroOpen(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmCancel(false);
    setModalCadastroOpen(false);
    setFormCadastro(defaultForm);
    setEtapaCadastro(1);
  };

  const handleSaveNovoUsuario = async () => {
    setSalvandoCadastro(true);
    try {
      await usuariosService.criar({ ...formCadastro, perfil: perfilSelecionado });
      setModalCadastroOpen(false);
      setFormCadastro(defaultForm);
      setEtapaCadastro(1);
      carregar();
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro ao criar usuário',
        mensagem: err.response?.data?.message || 'Ocorreu um erro ao criar o usuário.',
      });
    } finally {
      setSalvandoCadastro(false);
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

        <button className="btn btn-primary" onClick={() => setModalEscolhaOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          Criar usuário
        </button>
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
                        if (u.perfil === 'MOTORISTA') {
                          abrirMotorista(u.id);
                        } else {
                          setUsuarioSelecionado(u);
                          setModalUsuarioOpen(true);
                        }
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
        motorista={motoristaSelecionado ? {
          ...motoristaSelecionado,
          onOpenVeiculo: () => {
            setVeiculoSelecionado(motoristaSelecionado.veiculo);
            setModalVeiculoOpen(true);
            setModalMotoristaOpen(false);
          }
        } : null}
        onSave={handleSaveMotorista}
      />

      <ModalPerfilVeiculo
        isOpen={modalVeiculoOpen}
        onClose={() => setModalVeiculoOpen(false)}
        veiculo={veiculoSelecionado}
        isAdmin={true}
        onSave={handleSaveVeiculo}
      />

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal(prev => ({ ...prev, aberto: false }))}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />

      <Modal
        isOpen={modalEscolhaOpen}
        onClose={() => setModalEscolhaOpen(false)}
        title="Escolha o perfil"
        size="sm"
      >
        <style>{`
          .profile-select-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
            padding: 16px;
            background-color: var(--bg-800);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            color: var(--text-primary);
          }
          .profile-select-btn:hover {
            border-color: var(--color-primary-glow);
            background-color: var(--bg-700);
            transform: translateY(-2px);
          }
          .profile-select-btn:active,
          .profile-select-btn:focus-visible {
            outline: none;
            border-color: var(--color-primary);
            background-color: var(--bg-700);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
          }
          .profile-select-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: rgba(99, 102, 241, 0.1);
            color: var(--color-primary);
            flex-shrink: 0;
          }
          .profile-select-title {
            font-weight: 600;
            font-size: 1rem;
            display: block;
            margin-bottom: 2px;
            color: var(--text-primary);
          }
          .profile-select-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
            display: block;
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0 16px' }}>
          <button className="profile-select-btn" onClick={() => handleOpenCadastro('USUARIO')}>
            <div className="profile-select-icon">
              <User size={24} />
            </div>
            <div>
              <span className="profile-select-title">Passageiro</span>
              <span className="profile-select-desc">Solicita viagens no sistema</span>
            </div>
          </button>
          
          <button className="profile-select-btn" onClick={() => handleOpenCadastro('MOTORISTA')}>
            <div className="profile-select-icon">
              <Car size={24} />
            </div>
            <div>
              <span className="profile-select-title">Motorista</span>
              <span className="profile-select-desc">Realiza as viagens para os passageiros</span>
            </div>
          </button>
          
          <button className="profile-select-btn" onClick={() => handleOpenCadastro('ADMINISTRADOR')}>
            <div className="profile-select-icon">
              <Shield size={24} />
            </div>
            <div>
              <span className="profile-select-title">Administrador</span>
              <span className="profile-select-desc">Gerencia usuários e sistema</span>
            </div>
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalCadastroOpen}
        onClose={handleCloseCadastroRequest}
        title={`Novo ${perfilSelecionado === 'USUARIO' ? 'Passageiro' : perfilSelecionado === 'MOTORISTA' ? 'Motorista' : 'Administrador'}`}
        size="lg"
      >
        <div style={{ padding: '0 8px' }}>
          <FormularioDadosPessoais
            form={formCadastro}
            setForm={setFormCadastro}
            perfil={perfilSelecionado}
            etapa={etapaCadastro}
            onAvancar={setEtapaCadastro}
            onVoltar={setEtapaCadastro}
            onSubmit={handleSaveNovoUsuario}
            loading={salvandoCadastro}
          />
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleConfirmCancel}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja sair e perder essas alterações?"
        confirmText="Sair"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

export default UsuariosPage;
