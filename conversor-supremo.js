let colaboradores = [];
let substitutoMatricula = 5
let arquivoSelecionado = document.getElementById('arquivo')
let estaSelecionado = false
let btnProcessar = document.getElementById('btn-processar')
let empresas = [];

function processarArquivo() {
    const fileInput = document.getElementById('inputFile')
    const file = fileInput.files[0]

    if(!file) {
        return
    }

    const reader = new FileReader()

    reader.onload = function(event) {
        const fileContent = event.target.result
        processarConteudo(fileContent)
    }

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx')) {
        alert('O processamento de arquivos .xlsx requer bibliotecas adicionais.')
    }


    arquivoSelecionado.innerHTML = `Arquivo Convertido com Sucesso!`
    fileInput.value = ''
}

function processarConteudo(conteudoCompleto) {
    const lines = conteudoCompleto.split('\n');
    for (let index = 2; index < lines.length; index++) {
        // Se a linha estiver vazia, pule para a próxima iteração
        if (!lines[index].trim()) {
            continue;
        }

        // Cada linha do arquivo
        let infoColaborador = lines[index].split(",")

        // Corrigindo datas
        let matricula = removerZerosEsquerda(formatarSemPontuacao(infoColaborador[1]))

        // Criando o colaborador
        let colaborador = {
            nome: infoColaborador[0].trim(),
            pis: infoColaborador[3],
            cpf: formatarSemPontuacao(infoColaborador[7]),
            matricula: matricula,
            data_admissao: infoColaborador[6] ? formatarSemPontuacao(infoColaborador[6]) : primeiroDiaMesPassado(),
            data_inicio_marcacao: primeiroDiaMesPassado(),
            empresa: infoColaborador[4]
        }
        
        if(colaborador.empresa === '' || colaborador.empresa === '/1') {
        } else {
            if(empresas.length >= 1) {
                let empresaJaExiste = false;
                for (let index = 0; index < empresas.length; index++) {
                    if (colaborador.empresa === empresas[index].razao_social) {
                        empresaJaExiste = true;
                        break;
                    }
                }
                
                if (!empresaJaExiste) {
                    cnpjDaEmpresa = prompt(`Qual o CNPJ da Empresa '${colaborador.empresa}'?`);
                    empresas.push({
                        razao_social: colaborador.empresa,
                        cnpj: formatarCNPJCORRETO(cnpjDaEmpresa),
                    });
                }
            } else if(empresas.length === 0){
                cnpjDaEmpresa = prompt(`Qual o CNPJ da Empresa '${colaborador.empresa}'?`);
                empresas.push({
                    razao_social: colaborador.empresa,
                    cnpj: formatarCNPJCORRETO(cnpjDaEmpresa),
                });
            } else {
                alert("Erro não identificado:")
            }
        }

        if(colaborador.nome == '1' || colaborador.nome.split(':')[0] == 'Total') {
            // console.log("Linha padrão excluída")
        } else {
            colaboradores.push(colaborador);

            for(let index = 0; index < colaboradores.length; index++) {
                // console.log(`Informações do colaborador "${colaborador.nome}" convertidas com sucesso!`)
            }
        }
    }

    let csv = converterParaCSV(colaboradores)
    let blob = new Blob([csv], { type: 'text/csv' })
    let url = window.URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'planilha_importação.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    colaboradores = []
}

function converterParaCSV(data) {
    // Primeira linha para os títulos das colunas
    let csv = 'NOME,CPF,PIS,RG,MATRÍCULA,DATA ADMISSÃO,DATA DEMISSÃO,INICIO MARCAÇÃO,DOCUMENTO EMPRESA\n'
    let contador = 10000000001;

    for(let index = 0; index < data.length; index++) {
        let colaborador = data[index];
        for(let companyIndex = 0; companyIndex < empresas.length; companyIndex++) {
            console.log(empresas[companyIndex].razao_social)
            if(colaborador.empresa == empresas[companyIndex].razao_social) {
                colaborador.empresa = empresas[companyIndex].cnpj;
            }
        }
    }

    // Para cada colaborador, converter os dados em formato CSV
    data.forEach( (linha) => {
        contador++
        csv += linha.nome + ',' +
            (!linha.cpf  ? contador : linha.cpf) + ',' +
            (!linha.pis ? contador : linha.pis) + ',' +
            (linha.rg ? linha.rg : '') + ',' +
            linha.matricula + ',' +
            linha.data_admissao + ',' +
            (linha.data_demissao ? linha.data_demissao : '') + ',' +
            (linha.data_inicio_marcacao ? linha.data_inicio_marcacao : '') + ',' +
            linha.empresa + '\n'
        });

    return csv;
}

function corrigirFormatoData(data) {
    // Expressão regular modificada para capturar dias e meses com 1 ou 2 dígitos
    let regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    let match = data.match(regex);

    if (match) {
        // Preencher com zeros à esquerda para garantir 2 dígitos
        let dia = match[1].padStart(2, '0');
        let mes = match[2].padStart(2, '0');
        let ano = match[3];

        // Retornar no formato yyyymmdd
        return ano + mes + dia;
    } else {
        // Se não estiver no formato esperado, retorne a data como está
        return data;
    }
}

function formatarCNPJ(cnpj) {
    // Remove todos os caracteres não numéricos
    cnpj = `${formatarSemPontuacao(cnpj)}`

    // Verifica se o CNPJ tem exatamente 14 dígitos
    if (cnpj.length !== 14) {
        throw new Error("O CNPJ precisa ter exatamente 14 dígitos.");
    }

    // Insere os pontos, a barra e o traço nos locais corretos
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatarSemPontuacao(documento) {
    return documento.replace(/\D/g, '')
}

function removerZerosEsquerda(str) {
    return Number(str).toString();
}

function mostrarNomeArquivo() {
    // Convertendo o nome do arquivo
    let nomeCompletoArquivo = document.getElementById('inputFile').value
    let arrayNome = nomeCompletoArquivo.split('\\')
    let nomeConvertido = arrayNome[arrayNome.length - 1]

    // Trocando o nome do arquivo
    arquivoSelecionado.style.color = "rgb(68, 248, 68)"
    arquivoSelecionado.innerHTML = `${nomeConvertido}`

    btnProcessar.classList.add('btn-processar')
    btnProcessar.classList.remove('btn-processar-desativado')

    return (estaSelecionado = true)
}

function primeiroDiaMesPassado() {
    var hoje = new Date();
    var primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  
    // Obtém o primeiro dia do mês passado no formato desejado
    var dia = primeiroDiaMesAtual.getDate();
    var mes = primeiroDiaMesAtual.getMonth() + 1; // Os meses em JavaScript são indexados de 0 a 11
    var ano = primeiroDiaMesAtual.getFullYear();
  
    // Formata a data no estilo dddd-mm-aa
    var dataFormatada = ano + (mes < 10 ? '0' : '') + mes + (dia < 10 ? '0' : '') + dia;
  
    return dataFormatada;
  }

function formatarCNPJCORRETO(numeroCNPJ) {
    // Remove caracteres não numéricos
    const cnpjLimpo = numeroCNPJ.replace(/\D/g, '');

    // Aplica a formatação
    const cnpjFormatado = cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

    return cnpjFormatado;
}