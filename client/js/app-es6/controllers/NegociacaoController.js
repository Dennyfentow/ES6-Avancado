import {ListaNegociacoes} from '../models/ListaNegociacoes';
import {Mensagem} from '../models/Mensagem';
import {Negociacao} from '../models/Negociacao';
import {NegociacoesView} from '../views/NegociacoesView';
import {MensagemView} from '../views/MensagemView';
import {NegociacoesService} from '../services/NegociacoesService';
import {DateHelper} from '../helpers//DateHelper';
import {Bind} from '../helpers/Bind';

export class NegociacaoController {

    constructor() {

        let $ = document.querySelector.bind(document);
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');
        this._ordemAtual = ''; // quando a página for carregada, não tem critério. Só passa a ter quando ele começa a clicar nas colunas
        this._service = new NegociacoesService();
        // this._listaNegociacoes = new ListaNegociacoes(model => 
        //     this._negociacoesView.update(model));

        // Cria-se as listas de negociações onde são automaticamente atualizadas na view
        this._listaNegociacoes = new Bind(new ListaNegociacoes(),
            new NegociacoesView($('#negociacoesView')),
            'adiciona', 'esvazia', 'ordena', 'inverteOrdem');

        // this._mensagem = new Mensagem();
        // this._mensagemView = new MensagemView($('#mensagemView'));
        this._mensagem = new Bind(new Mensagem(),
            new MensagemView($('#mensagemView')),
            'texto');

        this._init();

    }

    _init() {
        // Jeito um pouco complicado, mas funcionando
        // ConnectionFactory.getConnection()
        //     .then(connection => {
        //         new NegociacaoDao(connection)
        //         .listaTodos()
        //         .then(negociacoes => {
        //             negociacoes.forEach(negociacao => {
        //                 this._listaNegociacoes.adiciona(negociacao);
        //             })
        //         })
        //     });

        this._service.lista()
            .then(negociacoes => // pega o objeto com as negociações e adiciona na lista, o proxy cuida de atualizar na View
                negociacoes.forEach(negociacao =>
                    this._listaNegociacoes.adiciona(negociacao)))
            .catch(erro => this._mensagem.texto = erro);

        setInterval(() => {
            this.importaNegociacoes();
        }, 3000);

    }

    adiciona(event) {
        event.preventDefault();

        let negociacao = this._criaNegociacao();

        this._service
            .cadastra(negociacao)
            .then(mensagem => {
                this._listaNegociacoes.adiciona(negociacao);
                this._mensagem.texto = mensagem;
                this._limpaFormulario();
            }).catch(erro => this._mensagem.texto = erro);
    }

    importaNegociacoes() {
        this._service.importa(this._listaNegociacoes.negociacoes)
            .then(negociacoes => {
                negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
                this._mensagem.texto = 'Negociações do período importadas com sucesso';
            }).catch(erro => this._mensagem.texto = erro);

    }

    apaga() {
        this._service.apaga()
        .then(mensagem => {
            this._mensagem.texto = mensagem;
            this._listaNegociacoes.esvazia();
        })
    }

    ordena(coluna) {
        if (this._ordemAtual == coluna) {
            this._listaNegociacoes.inverteOrdem();
        } else {
            this._listaNegociacoes.ordena((a, b) => a[coluna] - b[coluna]);
        }
        this._ordemAtual = coluna;
    }


    _criaNegociacao() {

        return new Negociacao(
            DateHelper.textoParaData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value)
        );
    }

    _limpaFormulario() {

        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;
        this._inputData.focus();
    }
}

let negociacaoController = new NegociacaoController();
// Mostrando aqui que o ES6 também exporta instancias atraves APENAS de uma função!
export function currentInstance() {
    return negociacaoController;
}