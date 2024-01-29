let colaboradores = []
let matriculas = []
let substitutoMatricula = 5
let arquivoSelecionado = document.getElementById('arquivo')
let estaSelecionado = false
let btnProcessar = document.getElementById('btn-processar')

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


    arquivoSelecionado.innerHTML = `Arquivo Convertido com Sucesos!`
    fileInput.value = ''
}

function processarConteudo(conteudoCompleto) {
    const lines = conteudoCompleto.split('\n');
    for (let index = 1; index < lines.length; index++) {
        // Se a linha estiver vazia, pule para a próxima iteração
        if (!lines[index].trim()) {
            continue;
        }

        // Cada linha do arquivo
        let infoColaborador = lines[index].split(",")

        // Corrigindo datas
        let data_admissao_corrigida = corrigirFormatoData(infoColaborador[5])
        let data_demissao_corrigida = corrigirFormatoData(infoColaborador[6])
        let data_inicio_marcacao_corrigida = corrigirFormatoData(infoColaborador[7])

        let matricula = removerZerosEsquerda(formatarSemPontuacao(infoColaborador[4]))

        if(matricula == '') {
            while(matriculas.includes(colaborador.matricula)) {
                substitutoMatricula += 1
            }
            
            matricula = substitutoMatricula
            
        }

        // Criando o colaborador
        let colaborador = {
            nome: infoColaborador[0].trim(),
            cpf: formatarSemPontuacao(infoColaborador[1]),
            pis: formatarSemPontuacao(infoColaborador[2]),
            rg: infoColaborador[3],
            matricula,
            data_admissao: data_admissao_corrigida,
            data_demissao: data_demissao_corrigida,
            data_inicio_marcacao: data_inicio_marcacao_corrigida,
            cnpj_convertido: formatarCNPJ(infoColaborador[8])
        }

    for(let index = 0; index < colaboradores.length; index++) {
        console.log(`Informações do colaborador "${colaborador.nome}" convertidas com sucesso!`)
    }

	// Verificando se a matrícula já existe no array de matrículas
        if (matriculas.includes(colaborador.matricula)) {
            
        } else {
            // Incluindo o colaborador no array de colaboradores e a matrícula no array de matrículas
            colaboradores.push(colaborador)
            matriculas.push(colaborador.matricula)
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
    matriculas = []
}

function converterParaCSV(data) {
    // Primeira linha para os títulos das colunas
    let csv = 'NOME,CPF,PIS,RG,MATRÍCULA,DATA ADMISSÃO,DATA DEMISSÃO,INICIO MARCAÇÃO,DOCUMENTO EMPRESA\n'
    let contador = 10000000001

    // Para cada colaborador, converter os dados em formato CSV
    data.forEach( (linha) => {
	contador++
	console.log(linha.cpf.length)
        csv += linha.nome + ',' +
            (linha.cpf.length < 11 ? contador : linha.cpf) + ',' +
            (linha.pis.length < 11 ? contador : linha.pis) + ',' +
            (linha.rg ? linha.rg : '') + ',' +
            linha.matricula + ',' +
            linha.data_admissao + ',' +
            (linha.data_demissao ? linha.data_demissao : '') + ',' +
            linha.data_inicio_marcacao + ',' +
            linha.cnpj_convertido + '\n'
    	
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
    // if (cnpj.length !== 14) {
    //    throw new Error("O CNPJ precisa ter exatamente 14 dígitos.");
    //}

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