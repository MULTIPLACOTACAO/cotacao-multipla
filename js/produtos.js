/* ======================================================
   NEXON CRM
   MÓDULO DE PRODUTOS
====================================================== */
let produtos = JSON.parse(localStorage.getItem("produtosCRM")) || [];

let produtoEditando = -1;

/* ==========================================
   SALVAR BANCO
========================================== */

function salvarProdutos() {
    localStorage.setItem(
        "produtosCRM",
        JSON.stringify(produtos)
    );
}

/* ==========================================
   GERAR ID
========================================== */

function gerarIdProduto() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/* ==========================================
   LIMPAR FORMULÁRIO
========================================== */

function limparProduto() {

    produtoEditando = -1;

    const campos = [
        "produtoNome",
        "produtoCategoria",
        "produtoUnidade",
        "produtoPreco",
        "produtoCusto",
        "produtoCodigo",
        "produtoDescricao",
        "produtoFoto"
    ];

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });

    const ativo = document.getElementById("produtoAtivo");
    if (ativo) ativo.checked = true;
}
function carregarCategoriasProduto() {

    const select =
        document.getElementById("produtoCategoria");

    if (!select) return;

    const categorias = new Set();

    // Categorias existentes no catálogo antigo
    if (typeof catalogo !== "undefined") {

        Object.keys(catalogo).forEach(function(categoria) {

            categorias.add(categoria);

        });

    }

    // Categorias dos produtos cadastrados
    if (
        typeof produtos !== "undefined" &&
        Array.isArray(produtos)
    ) {

        produtos.forEach(function(produto) {

            if (produto.categoria) {

                categorias.add(
                    produto.categoria.trim()
                );

            }

        });

    }

    select.innerHTML =
        '<option value="">Selecione uma categoria</option>';

    Array.from(categorias)
        .sort(function(a, b) {

            return a.localeCompare(b, "pt-BR");

        })
        .forEach(function(categoria) {

            const option =
                document.createElement("option");

            option.value = categoria;
            option.textContent = categoria;

            select.appendChild(option);

        });

    const novaCategoria =
        document.createElement("option");

    novaCategoria.value =
        "__NOVA_CATEGORIA__";

    novaCategoria.textContent =
        "➕ Criar nova categoria";

    select.appendChild(novaCategoria);
}
function tratarNovaCategoriaProduto() {

    const select =
        document.getElementById("produtoCategoria");

    if (!select) return;

    if (select.value !== "__NOVA_CATEGORIA__") {
        return;
    }

    const nova =
        prompt("Digite o nome da nova categoria:");

    if (!nova || !nova.trim()) {

        select.value = "";

        return;
    }

    const categoria =
        nova.trim();

    const categoriasExistentes =
        Array.from(select.options)
            .map(function(option) {
                return option.value.trim().toLowerCase();
            });

    if (
        categoriasExistentes.includes(
            categoria.toLowerCase()
        )
    ) {

        alert(
            "Essa categoria já existe. " +
            "Selecione a categoria existente."
        );

        select.value = "";

        return;
    }

    const option =
        document.createElement("option");

    option.value = categoria;
    option.textContent = categoria;

    const opcaoNova =
        select.querySelector(
            'option[value="__NOVA_CATEGORIA__"]'
        );

    select.insertBefore(
        option,
        opcaoNova
    );

    select.value = categoria;
}
function gerenciarCategoriasProduto() {

    const select =
        document.getElementById("produtoCategoria");

    if (!select) return;

    const categorias = Array.from(select.options)
        .map(function(option) {
            return option.value;
        })
        .filter(function(categoria) {
            return categoria &&
                   categoria !== "__NOVA_CATEGORIA__";
        });

    if (categorias.length === 0) {

        alert("Nenhuma categoria cadastrada.");

        return;
    }

    let mensagem =
        "Digite o número da categoria que deseja gerenciar:\n\n";

    categorias.forEach(function(categoria, index) {

        mensagem +=
            (index + 1) + " - " + categoria + "\n";

    });

    const escolha =
        prompt(mensagem);

    if (escolha === null) return;

    const numero =
        parseInt(escolha, 10);

    if (
        isNaN(numero) ||
        numero < 1 ||
        numero > categorias.length
    ) {

        alert("Categoria inválida.");

        return;
    }

    const categoriaSelecionada =
        categorias[numero - 1];

    const acao =
        prompt(
            "Categoria: " +
            categoriaSelecionada +
            "\n\n" +
            "Digite:\n" +
            "1 para EDITAR\n" +
            "2 para EXCLUIR"
        );

    if (acao === "1") {

        const novoNome =
            prompt(
                "Novo nome da categoria:",
                categoriaSelecionada
            );

        if (!novoNome || !novoNome.trim()) {
            return;
        }

        const nomeNovo =
            novoNome.trim();

        if (
            nomeNovo.toLowerCase() ===
            categoriaSelecionada.toLowerCase()
        ) {
            return;
        }

        const existe =
            categorias.some(function(categoria) {

                return categoria.toLowerCase() ===
                       nomeNovo.toLowerCase();

            });

        if (existe) {

            alert(
                "Essa categoria já existe."
            );

            return;
        }

        produtos.forEach(function(produto) {

            if (
                produto.categoria &&
                produto.categoria.trim().toLowerCase() ===
                categoriaSelecionada.toLowerCase()
            ) {

                produto.categoria = nomeNovo;

            }

        });

        salvarProdutos();

        alert(
            "Categoria alterada com sucesso!"
        );

        carregarCategoriasProduto();

        mostrarProdutos();

        return;
    }

    if (acao === "2") {

        const quantidadeProdutos =
            produtos.filter(function(produto) {

                return (
                    produto.categoria &&
                    produto.categoria.trim().toLowerCase() ===
                    categoriaSelecionada.toLowerCase()
                );

            }).length;

        if (quantidadeProdutos > 0) {

            alert(
                "Não é possível excluir esta categoria " +
                "porque existem " +
                quantidadeProdutos +
                " produto(s) dentro dela.\n\n" +
                "Primeiro altere ou exclua os produtos."
            );

            return;
        }

        const confirmar =
            confirm(
                'Excluir a categoria "' +
                categoriaSelecionada +
                '"?'
            );

        if (!confirmar) return;

        if (
            typeof catalogo !== "undefined" &&
            catalogo[categoriaSelecionada]
        ) {

            delete catalogo[categoriaSelecionada];

        }

        salvarProdutos();

        carregarCategoriasProduto();

        mostrarProdutos();

        alert(
            "Categoria excluída com sucesso!"
        );
    }
}
function mostrarPreviewProdutoFoto() {

    const campo =
        document.getElementById("produtoFoto");

    const preview =
        document.getElementById("previewProdutoFoto");

    if (!campo || !preview) return;

    preview.innerHTML = "";

    if (!campo.files || !campo.files[0]) {
        return;
    }

    const arquivo = campo.files[0];

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione uma imagem válida.");
        campo.value = "";
        return;
    }

    const imagem =
        document.createElement("img");

    imagem.src =
        URL.createObjectURL(arquivo);

    imagem.style.maxWidth = "180px";
    imagem.style.maxHeight = "180px";
    imagem.style.objectFit = "contain";
    imagem.style.borderRadius = "10px";
    imagem.style.marginTop = "8px";

    preview.appendChild(imagem);
}
/* ==========================================
   CADASTRAR / ATUALIZAR PRODUTO
========================================== */

function salvarProduto() {

    const produto = {

        id: produtoEditando === -1
            ? gerarIdProduto()
            : produtos[produtoEditando].id,

        nome: document.getElementById("produtoNome").value.trim(),

        categoria: document.getElementById("produtoCategoria").value.trim(),

        unidade: document.getElementById("produtoUnidade").value.trim(),

        preco: Number(
            document.getElementById("produtoPreco").value
        ),

        custo: Number(
            document.getElementById("produtoCusto").value || 0
        ),

        codigo: document.getElementById("produtoCodigo").value.trim(),

        descricao: document.getElementById("produtoDescricao").value.trim(),

   foto: "",

        ativo: document.getElementById("produtoAtivo").checked

    };

    /* ========= VALIDAÇÕES ========= */

    if (!produto.nome) {

        alert("Informe o nome do produto.");

        return;

    }

    if (!produto.categoria) {

        alert("Informe a categoria.");

        return;

    }

    if (!produto.unidade) {

        alert("Informe a unidade.");

        return;

    }

    if (produto.preco <= 0) {

        alert("Informe um preço válido.");

        return;

    }

    /* ========= CÓDIGO DUPLICADO ========= */

    if (produto.codigo !== "") {

        const existe = produtos.find((p, i) =>

            p.codigo === produto.codigo &&
            i !== produtoEditando

        );

        if (existe) {

            alert("Já existe um produto com esse código.");

            return;

        }

    }

    /* ========= NOVO ========= */

    if (produtoEditando === -1) {

        produtos.push(produto);

    }

    /* ========= EDITAR ========= */

    else {

        produtos[produtoEditando] = produto;

    }
const campoFoto =
    document.getElementById("produtoFoto");

if (
    campoFoto &&
    campoFoto.files &&
    campoFoto.files[0]
) {

    const arquivo =
        campoFoto.files[0];

    const leitor =
        new FileReader();

    leitor.onload = function(evento) {

        produto.foto =
            evento.target.result;

        salvarProdutos();

        sincronizarProdutosComCatalogo();

        limparProduto();

        mostrarProdutos();

    };

    leitor.readAsDataURL(arquivo);

} else {

    produto.foto = "";

    salvarProdutos();

    sincronizarProdutosComCatalogo();

    limparProduto();

    mostrarProdutos();  
}
}
/* ==========================================
   MOSTRAR PRODUTOS
========================================== */
function filtrarProdutosCadastro() {

    const campo =
        document.getElementById("pesquisaProdutos");

    const lista =
        document.getElementById("listaProdutos");

    if (!campo || !lista) return;

    const busca =
        campo.value.trim().toLowerCase();

    const resultados =
        produtos.filter(function(produto) {

            return (
                (produto.nome || "")
                    .toLowerCase()
                    .includes(busca) ||

                (produto.codigo || "")
                    .toLowerCase()
                    .includes(busca) ||

                (produto.categoria || "")
                    .toLowerCase()
                    .includes(busca)
            );

        });

    if (resultados.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">🔎</span>
                Nenhum produto encontrado
            </div>
        `;

        return;
    }

    lista.innerHTML = "";

    resultados
        .sort((a, b) =>
            a.nome.localeCompare(b.nome)
        )
        .forEach(function(produto) {

            const index =
                produtos.indexOf(produto);

            lista.innerHTML += `

                <div class="cliente-card">

                    <div class="cliente-header">

                        <strong>
                            ${produto.nome}
                        </strong>

                    </div>

                    <div>
                        <small>
                            Código:
                            ${produto.codigo || "-"}
                        </small>
                    </div>

                    <div>
                        <small>
                            Categoria:
                            ${produto.categoria || "-"}
                        </small>
                    </div>

                    <div style="margin-top:10px;">

                        <button
                            onclick="editarProduto(${index})">
                            ✏️ Editar
                        </button>

                        <button
                            onclick="excluirProduto(${index})">
                            🗑️ Excluir
                        </button>

                    </div>

                </div>
            `;

        });
}
function mostrarProdutos() {

    const lista = document.getElementById("listaProdutos");

    if (!lista) return;
carregarCategoriasProduto();
    if (produtos.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📦</span>
                Nenhum produto cadastrado
            </div>
        `;

        return;
    }

    lista.innerHTML = "";

    produtos
    .sort((a,b)=>a.nome.localeCompare(b.nome))
    .forEach((produto,index)=>{

        lista.innerHTML += `

        <div class="cliente-card">

            <div class="cliente-header">

                <strong>${produto.nome}</strong>

                <span>
                    R$ ${produto.preco.toFixed(2)}
                </span>

            </div>

            <div class="cliente-info">

                Categoria:
                ${produto.categoria}

                <br>

                Unidade:
                ${produto.unidade}

                <br>

                Código:
                ${produto.codigo || "-"}

            </div>

            <div
              style="
                display:flex;
                gap:8px;
                margin-top:12px;">

                <button
                  class="btn-edit"
                  onclick="editarProduto(${index})">

                    ✏️ Editar

                </button>

                <button
                  class="btn-del"
                  onclick="excluirProduto(${index})">

                    🗑 Excluir

                </button>

            </div>

        </div>

        `;

    });

}
/* ==========================================
   EDITAR PRODUTO
========================================== */

function editarProduto(index){

    produtoEditando = index;

    const produto = produtos[index];

    document.getElementById("produtoNome").value = produto.nome;
    document.getElementById("produtoCategoria").value = produto.categoria;
    document.getElementById("produtoUnidade").value = produto.unidade;
    document.getElementById("produtoPreco").value = produto.preco;
    document.getElementById("produtoCusto").value = produto.custo;
    document.getElementById("produtoCodigo").value = produto.codigo;
    document.getElementById("produtoDescricao").value = produto.descricao;
    document.getElementById("produtoFoto").value = produto.foto;
    document.getElementById("produtoAtivo").checked = produto.ativo;

}

/* ==========================================
   EXCLUIR PRODUTO
========================================== */

function excluirProduto(index){

    if(!confirm("Deseja realmente excluir este produto?"))
        return;

    produtos.splice(index,1);

    salvarProdutos();

    mostrarProdutos();

}

/* ==========================================
   DUPLICAR PRODUTO
========================================== */

function duplicarProduto(index){

    let novo = {

        ...produtos[index],

        id: gerarIdProduto(),

        nome: produtos[index].nome + " (Cópia)"

    };

    produtos.push(novo);

    salvarProdutos();

    mostrarProdutos();

}
/* ==========================================
   CADASTRAR PRODUTO
========================================== */


/* ======================================================
   INTEGRAÇÃO DOS PRODUTOS CADASTRADOS COM O CATÁLOGO
====================================================== */

function sincronizarProdutosComCatalogo() {

    // Verifica se o catálogo principal já existe
    if (typeof catalogo === "undefined") {
        return;
    }

    // Recupera os produtos que este módulo adicionou
    const antigos =
        JSON.parse(
            localStorage.getItem("produtosCatalogoNexon")
        ) || [];

    // Remove do catálogo os produtos que foram
    // adicionados anteriormente pelo módulo
    antigos.forEach(item => {

        if (!item.categoria || !item.produto) {
            return;
        }

        if (catalogo[item.categoria]) {

            catalogo[item.categoria] =
                catalogo[item.categoria].filter(
                    p => p !== item.produto
                );

        }

    });

    const novos = [];

    // Adiciona somente produtos ativos
    produtos.forEach(produto => {

        if (!produto.ativo) {
            return;
        }

        const categoria =
            produto.categoria.trim() || "Outros";

        // Código interno
        const codigo =
            produto.codigo.trim() ||
            ("PRD" + String(produto.id).slice(-6));

        // Formato compatível com o catálogo atual
        const nomeCatalogo =
            codigo + " - " + produto.nome;

        // Cria a categoria se ainda não existir
        if (!catalogo[categoria]) {
            catalogo[categoria] = [];
        }

        // Evita duplicação
        if (!catalogo[categoria].includes(nomeCatalogo)) {

            catalogo[categoria].push(nomeCatalogo);

        }

        novos.push({
            categoria: categoria,
            produto: nomeCatalogo
        });

    });

    // Guarda somente o que foi acrescentado
    localStorage.setItem(
        "produtosCatalogoNexon",
        JSON.stringify(novos)
    );

    // Atualiza a área de categorias do cliente
    if (
        typeof carregarCategorias === "function"
    ) {
        carregarCategorias();
    }

    // Atualiza a área de orçamento
    if (
        typeof carregarProdutosOrcamento === "function"
    ) {
        carregarProdutosOrcamento();
    }

}
/* ======================================================
   SINCRONIZAÇÃO AO ABRIR O SISTEMA
====================================================== */

window.addEventListener("load", function () {

    setTimeout(function () {

        if (typeof sincronizarProdutosComCatalogo === "function") {
            sincronizarProdutosComCatalogo();
        }

    }, 500);

});
/* ======================================================
   MIGRAR PRODUTOS ANTIGOS DO CATÁLOGO PARA O CADASTRO
====================================================== */

function migrarProdutosAntigos() {

    if (typeof catalogo === "undefined") {

        alert("Catálogo antigo não encontrado.");

        return;

    }

    let produtosAtuais =
        JSON.parse(localStorage.getItem("produtosCRM")) || [];

    let quantidadeAdicionada = 0;

    Object.keys(catalogo).forEach(function(categoria) {

        catalogo[categoria].forEach(function(item) {

            const separador = item.indexOf(" - ");

            if (separador === -1) {
                return;
            }

            const codigo =
                item.substring(0, separador).trim();

            const nome =
                item.substring(separador + 3).trim();

            /* Evita cadastrar duas vezes */

            const jaExiste = produtosAtuais.some(function(produto) {

                return produto.codigo === codigo;

            });

            if (jaExiste) {
                return;
            }

            produtosAtuais.push({

                id:
                    Date.now() +
                    Math.floor(Math.random() * 100000),

                nome: nome,

                categoria: categoria,

                unidade: "un",

                preco: 0,

                custo: 0,

                codigo: codigo,

                foto: "",

                descricao: "",

                ativo: true

            });

            quantidadeAdicionada++;

        });

    });

    localStorage.setItem(
        "produtosCRM",
        JSON.stringify(produtosAtuais)
    );

    produtos = produtosAtuais;

    if (typeof mostrarProdutos === "function") {
        mostrarProdutos();
    }

    alert(
        quantidadeAdicionada +
        " produtos antigos foram adicionados ao cadastro."
    );

}
