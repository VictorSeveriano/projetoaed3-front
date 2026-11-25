import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BotoesExportacao from '../../components/ui/BotoesExportacao';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { ModalPerfilUsuario, ModalPerfilMotorista, ModalPerfilVeiculo } from '../../components/ui/ModaisPerfil';
import ModalErro from '../../components/ui/ModalErro';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalEscolhaPerfil from '../../components/ui/ModalEscolhaPerfil';
import ModalCadastroUsuario from '../../components/ui/ModalCadastroUsuario';
import usuariosService from '../../services/usuarios.service';
import motoristasService from '../../services/motoristas.service';
import veiculosService from '../../services/veiculos.service';
import { User, Search, Filter, Plus } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const defaultForm = {
  nome: '', cpf: '', celular: '', email: '',
  endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' },
  senha: '', senhaConfirmacao: '', cnh: '',
};

const PERFIL_BADGE = {
  ADMINISTRADOR: { label: 'Administrador', color: 'danger' },
  MOTORISTA:     { label: 'Motorista',     color: 'warning' },
  USUARIO:       { label: 'Passageiro',    color: 'info' },
};

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
  const [formCadastro, setFormCadastro] = useState(defaultForm);
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Filters state
  const [filtroPesquisa, setFiltroPesquisa] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [exportandoFormato, setExportandoFormato] = useState('');

  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const [confirmacaoExclusaoOpen, setConfirmacaoExclusaoOpen] = useState(false);
  const [excluindoUsuario, setExcluindoUsuario] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const termoBusca = filtroPesquisa.trim();
      const res = await usuariosService.listarTodos({ search: termoBusca, perfil: filtroPerfil });
      setUsuarios(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const primeiraCargaRef = React.useRef(true);

  useEffect(() => {
    if (primeiraCargaRef.current) {
      primeiraCargaRef.current = false;
      carregar();
      return undefined;
    }
    const timer = setTimeout(() => {
      carregar();
    }, 300);

    return () => clearTimeout(timer);
  }, [filtroPesquisa, filtroPerfil]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    carregar();
  };

  const limparFiltrosUsuarios = () => {
    setFiltroPesquisa('');
    setFiltroPerfil('');
  };

  const handleExportarUsuarios = async (formato) => {
    setExportandoFormato(formato);
    try {
      const filtrosAtivos = {};
      if (filtroPesquisa.trim()) filtrosAtivos.search = filtroPesquisa.trim();
      if (filtroPerfil) filtrosAtivos.perfil = filtroPerfil;
      await usuariosService.exportarRelatorio(formato, filtrosAtivos);
    } catch (err) {
      setErroModal({
        aberto: true,
        titulo: 'Erro na exportação',
        mensagem: err?.message || 'Não foi possível exportar os usuários filtrados.',
      });
    } finally {
      setExportandoFormato('');
    }
  };

  const abrirConfirmacaoExclusao = (usuario) => {
    setUsuarioParaExcluir(usuario);
    setConfirmacaoExclusaoOpen(true);
  };

  const handleExcluirUsuario = async () => {
    if (!usuarioParaExcluir) return;

    setExcluindoUsuario(true);
    try {
      await usuariosService.excluir(usuarioParaExcluir.id);
      setConfirmacaoExclusaoOpen(false);
      setUsuarioParaExcluir(null);
      await carregar();
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Não foi possível excluir o usuário',
        mensagem: err.response?.data?.message || 'O usuário possui dependências ativas e não pode ser removido no momento.',
      });
      setConfirmacaoExclusaoOpen(false);
      setUsuarioParaExcluir(null);
    } finally {
      setExcluindoUsuario(false);
    }
  };

  const handleSaveUsuario = async (id, dados) => {
    try {
      await usuariosService.atualizar(id, dados);
      await carregar();
      setUsuarioSelecionado((prev) => ({ ...prev, ...dados }));
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
      setMotoristaSelecionado((prev) => ({
        ...prev,
        ...dados,
        usuario: {
          ...prev.usuario,
          nome: dados.nome,
          usuario: dados.usuario,
          cpf: dados.cpf,
          email: dados.email,
          celular: dados.celular,
          endereco: dados.endereco,
        },
        cnh: dados.cnh,
      }));
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
      setVeiculoSelecionado((prev) => ({ ...prev, ...dados }));
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
      const motorista = await motoristasService.buscarPorUsuarioId(usuarioId);
      if (motorista) {
        setMotoristaSelecionado(motorista);
        setModalMotoristaOpen(true);
        setModalUsuarioOpen(false);
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

  const abrirDetalhesUsuario = (u) => {
    if (u.perfil === 'MOTORISTA') {
      abrirMotorista(u.id);
    } else {
      setUsuarioSelecionado(u);
      setModalUsuarioOpen(true);
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
      <Header
        title="Usuários"
        subtitle="Gerencie os usuários cadastrados no sistema"
        actions={
          <div className="btn-group">
            <BotoesExportacao
              idPrefix="btn-exportar-usuarios"
              exportandoFormato={exportandoFormato}
              onExportar={handleExportarUsuarios}
            />
            <Button type="button" variant="primary" onClick={() => setModalEscolhaOpen(true)}>
              <Plus size={17} aria-hidden="true" />
              Criar usuário
            </Button>
          </div>
        }
      />

      {/* Barra de Ferramentas / Filtros */}
      <div className="tools-bar">
        <form onSubmit={handleSearchSubmit} className="tools-bar__search">
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="input-with-icon__icon" aria-hidden="true"><Search size={17} /></span>
            <input
              type="text"
              className="input-field"
              aria-label="Pesquisar usuários por nome ou usuário"
              placeholder="Pesquisar por nome ou usuário..."
              value={filtroPesquisa}
              onChange={(e) => setFiltroPesquisa(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>

        <div className="tools-bar__field">
          <div className="input-with-icon">
            <span className="input-with-icon__icon" aria-hidden="true"><Filter size={16} /></span>
            <select
              className="input-field input-field--select"
              aria-label="Filtrar por perfil"
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
            >
              <option value="">Todos os perfis</option>
              <option value="USUARIO">Passageiro</option>
              <option value="MOTORISTA">Motorista</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
        </div>

        {(filtroPesquisa || filtroPerfil) && (
          <Button type="button" variant="ghost" size="sm" onClick={limparFiltrosUsuarios}>
            Limpar
          </Button>
        )}
      </div>

      {loading ? (
        <Loading message="Carregando usuários..." />
      ) : usuarios.length === 0 ? (
        <EmptyState
          icon={<User size={32} strokeWidth={1.5} />}
          title="Nenhum usuário encontrado"
          description="Não existem usuários correspondentes aos filtros selecionados."
        />
      ) : (
        <>
          <div className="table-wrapper table-desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Usuário</th>
                  <th scope="col">Perfil</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const badgeInfo = PERFIL_BADGE[u.perfil] || { label: u.perfil, color: 'info' };
                  return (
                    <tr key={u.id} className="data-table__row">
                      <td className="data-table__cell">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => abrirDetalhesUsuario(u)}
                        >
                          {u.nome}
                        </button>
                      </td>
                      <td className="data-table__cell text-secondary">@{u.usuario}</td>
                      <td className="data-table__cell">
                        <Badge label={badgeInfo.label} color={badgeInfo.color} />
                      </td>
                      <td className="data-table__cell tabular-nums">{formatarData(u.criadoEm)}</td>
                      <td className="data-table__cell">
                        <div className="btn-group btn-group--nowrap">
                          <Button type="button" variant="outline" size="sm" onClick={() => abrirDetalhesUsuario(u)}>
                            Ver detalhes
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => abrirConfirmacaoExclusao(u)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards-list cards-mobile-only">
            {usuarios.map((u) => {
              const badgeInfo = PERFIL_BADGE[u.perfil] || { label: u.perfil, color: 'info' };
              return (
                <article key={u.id} className="mobile-data-card">
                  <div className="mobile-data-card__header">
                    <div>
                      <h3 className="mobile-data-card__title">{u.nome}</h3>
                      <p className="mobile-data-card__subtitle">@{u.usuario}</p>
                    </div>
                    <Badge label={badgeInfo.label} color={badgeInfo.color} />
                  </div>
                  <div className="mobile-data-card__grid">
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">Cadastro</span>
                      <span className="mobile-data-card__value tabular-nums">{formatarData(u.criadoEm)}</span>
                    </div>
                    {u.email && (
                      <div className="mobile-data-card__field">
                        <span className="mobile-data-card__label">E-mail</span>
                        <span className="mobile-data-card__value">{u.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="mobile-data-card__actions">
                    <Button type="button" variant="outline" size="sm" onClick={() => abrirDetalhesUsuario(u)}>
                      Ver detalhes
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => abrirConfirmacaoExclusao(u)}>
                      Excluir
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Modais */}
      <ModalPerfilUsuario
        isOpen={modalUsuarioOpen}
        onClose={() => setModalUsuarioOpen(false)}
        usuario={usuarioSelecionado ? {
          ...usuarioSelecionado,
          onOpenMotorista: () => abrirMotorista(usuarioSelecionado.id),
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
          },
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
        onClose={() => setErroModal((prev) => ({ ...prev, aberto: false }))}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />

      <ModalEscolhaPerfil
        isOpen={modalEscolhaOpen}
        onClose={() => setModalEscolhaOpen(false)}
        onSelect={handleOpenCadastro}
      />

      <ModalCadastroUsuario
        isOpen={modalCadastroOpen}
        onClose={handleCloseCadastroRequest}
        perfilSelecionado={perfilSelecionado}
        formCadastro={formCadastro}
        setFormCadastro={setFormCadastro}
        etapaCadastro={etapaCadastro}
        setEtapaCadastro={setEtapaCadastro}
        handleSaveNovoUsuario={handleSaveNovoUsuario}
        salvandoCadastro={salvandoCadastro}
      />

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

      <ConfirmationModal
        isOpen={confirmacaoExclusaoOpen}
        onClose={() => setConfirmacaoExclusaoOpen(false)}
        onConfirm={handleExcluirUsuario}
        title="Excluir usuário?"
        message={
          usuarioParaExcluir
            ? `Tem certeza que deseja excluir ${usuarioParaExcluir.nome}? A conta será marcada como inativa e o histórico será preservado.`
            : 'Tem certeza que deseja excluir este usuário?'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={excluindoUsuario}
      />
    </div>
  );
};

export default UsuariosPage;
