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
let salvamentoProdutoEmAndamento = false;

function salvarProduto() {

    if (salvamentoProdutoEmAndamento) {
        return;
    }

    salvamentoProdutoEmAndamento = true;

    const liberarSalvamento = function() {
        salvamentoProdutoEmAndamento = false;
    };

    try {

        const indiceProdutoEmEdicao = produtoEditando;

        if (
            indiceProdutoEmEdicao !== -1 &&
            (
                typeof indiceProdutoEmEdicao !== "number" ||
                indiceProdutoEmEdicao < 0 ||
                indiceProdutoEmEdicao >= produtos.length ||
                !produtos[indiceProdutoEmEdicao]
            )
        ) {
            alert("Não foi possível localizar o produto para atualizar.");
            liberarSalvamento();
            return;
        }

        const produto = {
            id: indiceProdutoEmEdicao === -1
                ? gerarIdProduto()
                : produtos[indiceProdutoEmEdicao].id,

            nome: document.getElementById("produtoNome").value.trim(),
            categoria: document.getElementById("produtoCategoria").value.trim(),
            unidade: document.getElementById("produtoUnidade").value.trim(),
            preco: Number(document.getElementById("produtoPreco").value),
            custo: Number(document.getElementById("produtoCusto").value || 0),
            codigo: document.getElementById("produtoCodigo").value.trim(),
            descricao: document.getElementById("produtoDescricao").value.trim(),

            foto: indiceProdutoEmEdicao === -1
                ? ""
                : (produtos[indiceProdutoEmEdicao].foto || ""),

            ativo: document.getElementById("produtoAtivo").checked
        };

        if (!produto.nome) {
            alert("Informe o nome do produto.");
            liberarSalvamento();
            return;
        }

        if (!produto.categoria) {
            alert("Informe a categoria.");
            liberarSalvamento();
            return;
        }

        if (!produto.unidade) {
            alert("Informe a unidade.");
            liberarSalvamento();
            return;
        }

        const campoPreco = document.getElementById("produtoPreco");
        const valorPreco = campoPreco.value.trim();

        if (
            valorPreco !== "" &&
            (
                !Number.isFinite(Number(valorPreco)) ||
                Number(valorPreco) < 0
            )
        ) {
            alert("Informe um preço válido ou deixe o campo vazio.");
            liberarSalvamento();
            return;
        }

        const codigoNormalizado = String(produto.codigo || "")
            .trim()
            .toLowerCase();

        if (codigoNormalizado !== "") {

            const existe = produtos.find(function(p, i) {
                if (i === indiceProdutoEmEdicao) {
                    return false;
                }

                return String(p.codigo || "").trim().toLowerCase()
                    === codigoNormalizado;
            });

            if (existe) {
                alert(
                    "Já existe um produto com esse código.\n\n" +
                    "Produto: " + (existe.nome || "Produto cadastrado") +
                    "\nCódigo: " + (existe.codigo || produto.codigo)
                );

                liberarSalvamento();
                return;
            }
        }

        const campoFoto = document.getElementById("produtoFoto");

        const concluirSalvamento = function() {
            try {
                const resultado = finalizarSalvamentoProduto(
                    produto,
                    indiceProdutoEmEdicao
                );

                liberarSalvamento();

                return resultado !== false;

            } catch (erro) {
                liberarSalvamento();
                console.error("Erro ao salvar produto:", erro);
             alert(
    "Erro ao salvar: " +
    (erro.name || "Erro") +
    "\nDetalhes: " +
    (erro.message || erro)
); 
                return false;
            }
        };

        if (campoFoto && campoFoto.files && campoFoto.files[0]) {

            const arquivo = campoFoto.files[0];

            if (!arquivo.type.startsWith("image/")) {
                alert("Selecione um arquivo de imagem válido.");
                liberarSalvamento();
                return;
            }

            if (arquivo.size > 12 * 1024 * 1024) {
                alert("A imagem deve ter no máximo 12 MB.");
                liberarSalvamento();
                return;
            }

            const leitor = new FileReader();

            leitor.onerror = function() {
                alert("Não foi possível ler a foto. Tente outra imagem.");
                liberarSalvamento();
            };

            leitor.onload = function(evento) {

                const imagem = new Image();

                imagem.onerror = function() {
                    alert("Não foi possível processar a imagem selecionada.");
                    liberarSalvamento();
                };

                imagem.onload = function() {

                    try {

                        const limite = 1000;

                        const proporcao = Math.min(
                            1,
                            limite / Math.max(imagem.width, imagem.height)
                        );

                        const canvas = document.createElement("canvas");

                        canvas.width = Math.max(
                            1,
                            Math.round(imagem.width * proporcao)
                        );

                        canvas.height = Math.max(
                            1,
                            Math.round(imagem.height * proporcao)
                        );

                        const contexto = canvas.getContext("2d");

                        if (!contexto) {
                            alert("Não foi possível processar a foto.");
                            liberarSalvamento();
                            return;
                        }

                        contexto.fillStyle = "#ffffff";
                        contexto.fillRect(0, 0, canvas.width, canvas.height);

                        contexto.drawImage(
                            imagem,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );

                        produto.foto = canvas.toDataURL("image/jpeg", 0.82);

                        concluirSalvamento();

                    } catch (erro) {
                        console.error("Erro ao processar foto:", erro);
                        alert("Não foi possível preparar a foto. Tente uma imagem menor.");
                        liberarSalvamento();
                    }
                };

                imagem.src = evento.target.result;
            };

            leitor.readAsDataURL(arquivo);
            return;
        }

        concluirSalvamento();

    } catch (erro) {
        console.error("Erro ao iniciar salvamento:", erro);
        alert("Não foi possível iniciar o salvamento do produto.");
        liberarSalvamento();
    }
}

/* ==========================================
   FINALIZAR SALVAMENTO DO PRODUTO
========================================== */


function finalizarSalvamentoProduto(produto, indiceProdutoEmEdicao) {

    /* ========= VALIDAR E SALVAR ========= */

    if (indiceProdutoEmEdicao === -1) {

        produtos.push(produto);

    } else {

        if (
            typeof indiceProdutoEmEdicao !== "number" ||
            indiceProdutoEmEdicao < 0 ||
            indiceProdutoEmEdicao >= produtos.length ||
            !produtos[indiceProdutoEmEdicao]
        ) {
            alert("Não foi possível localizar o produto para atualizar.");
            return false;
        }

        produtos[indiceProdutoEmEdicao] = produto;
    }

    /* ========= PERSISTIR E ATUALIZAR ========= */

    salvarProdutos();

    sincronizarProdutosComCatalogo();

    limparProduto();

    mostrarProdutos();

    /* ========= CONFIRMAÇÃO ========= */

    alert(
        indiceProdutoEmEdicao === -1
            ? "Produto cadastrado com sucesso!"
            : "Produto atualizado com sucesso!"
    );

    return true;
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
        campo.value
            .trim()
            .toLowerCase();

    const resultados =
        produtos.filter(function(produto) {

            const nome =
                String(produto.nome || "")
                    .toLowerCase();

            const codigo =
                String(produto.codigo || "")
                    .toLowerCase();

            const categoria =
                String(produto.categoria || "")
                    .toLowerCase();

            const unidade =
                String(produto.unidade || "")
                    .toLowerCase();

            const descricao =
                String(produto.descricao || "")
                    .toLowerCase();

            return (
                nome.includes(busca) ||
                codigo.includes(busca) ||
                categoria.includes(busca) ||
                unidade.includes(busca) ||
                descricao.includes(busca)
            );

        });

    if (resultados.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">

                <span class="empty-state-icon">
                    🔎
                </span>

                Nenhum produto encontrado

            </div>
        `;

        return;
    }

    lista.innerHTML = "";

    resultados
        .sort(function(a, b) {

            return String(
                a.nome || ""
            ).localeCompare(
                String(b.nome || "")
            );

        })
        .forEach(function(produto) {

            const index =
                produtos.indexOf(produto);

            const preco =
                Number(produto.preco || 0);

            const precoFormatado =
                preco.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );

            lista.innerHTML += `

                <div class="cliente-card">

                    <div class="cliente-header">

                        <strong>
                            ${produto.nome || ""}
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

                    <div>

                        <small>
                            Unidade:
                            ${produto.unidade || "-"}
                        </small>

                    </div>

         <div style="margin-top:6px;">

    <small>
        💰 Preço de Venda:
        <strong>
            ${precoFormatado}
        </strong>
    </small>

</div>

<div style="margin-top:4px;">

    <small>
        🧾 Custo:
        <strong>
            ${Number(produto.custo || 0).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            )}
        </strong>
    </small>

</div>

<div style="margin-top:4px;">

    <small>
        ${produto.ativo !== false ? "🟢" : "🔴"}
        Status:
        <strong>
            ${produto.ativo !== false ? "ATIVO" : "INATIVO"}
        </strong>
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

const campoPesquisa =
    document.getElementById("pesquisaProdutos");

const filtro =
    (campoPesquisa?.value || "")
        .toLowerCase()
        .trim();

produtos
    .map((produto, index) => ({
        produto,
        index
    }))
    .filter(({ produto }) => {

        const texto = [
            produto.nome,
            produto.codigo,
            produto.categoria,
            produto.unidade,
            produto.descricao
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

        return texto.includes(filtro);

    })
    .sort((a, b) =>
        a.produto.nome.localeCompare(
            b.produto.nome
        )
    )
    .forEach(({ produto, index }) => {
        lista.innerHTML += `

        <div class="cliente-card">

          <div class="cliente-header">

    <div style="display:flex; align-items:center; gap:12px;">

        ${
            produto.foto
                ? `
                    <img
                        src="${produto.foto}"
                        alt="${produto.nome}"
                        style="
                            width:70px;
                            height:70px;
                            object-fit:contain;
                            border-radius:10px;
                            border:1px solid #ddd;
                            background:#fff;">
                  `
                : `
                    <div
                        style="
                            width:70px;
                            height:70px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            border-radius:10px;
                            border:1px solid #ddd;
                            background:#f5f5f5;">
                        📦
                    </div>
                  `
        }

        <strong>${produto.nome}</strong>

    </div>

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



function editarProduto(index) {

    const produto = produtos[index];
console.log("Índice selecionado:", index);
console.log("Produto selecionado:", produto);
console.log("Nome encontrado:", produto?.nome);
    if (!produto) {
        alert("Não foi possível localizar esse produto.");
        return;
    }

    // Mantém o índice do produto que está sendo editado
    produtoEditando = index;

    // Abre a aba de produtos
    const botaoProdutos = document.getElementById("btnProdutos");
    mostrarTab("produtos", botaoProdutos);

    // Preenche os campos com os dados já cadastrados
    document.getElementById("produtoNome").value =
        produto.nome || "";

    document.getElementById("produtoCategoria").value =
        produto.categoria || "";

    document.getElementById("produtoUnidade").value =
        produto.unidade || "";

    document.getElementById("produtoPreco").value =
        produto.preco ?? "";

    document.getElementById("produtoCusto").value =
        produto.custo ?? "";

    document.getElementById("produtoCodigo").value =
        produto.codigo || "";

    document.getElementById("produtoDescricao").value =
        produto.descricao || "";

    // Limpa apenas o campo de seleção de uma nova foto
    document.getElementById("produtoFoto").value = "";

    document.getElementById("produtoAtivo").checked =
        produto.ativo !== false;

    // Exibe a foto já cadastrada, se houver
    const preview = document.getElementById("previewProdutoFoto");

    if (preview) {
        preview.innerHTML = "";

        if (produto.foto) {
            const imagem = document.createElement("img");

            imagem.src = produto.foto;
            imagem.alt = "Foto atual do produto";
            imagem.style.maxWidth = "180px";
            imagem.style.maxHeight = "180px";
            imagem.style.objectFit = "contain";
            imagem.style.borderRadius = "10px";
            imagem.style.marginTop = "8px";

            preview.appendChild(imagem);
        }
    }

    // Leva o formulário à tela
    document.getElementById("tab-produtos").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================
   EXCLUIR PRODUTO
========================================== */

function excluirProduto(index){

    if (
        index < 0 ||
        index >= produtos.length
    ) {
        return;
    }

    const produto = produtos[index];

    if (
        !confirm(
            "Deseja realmente excluir o produto \"" +
            (produto.nome || "") +
            "\"?"
        )
    ) {
        return;
    }

    produtos.splice(index, 1);

    salvarProdutos();

    sincronizarProdutosComCatalogo();

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

    if (typeof catalogo === "undefined") {
        return false;
    }

    try {

        const antigos = JSON.parse(
            localStorage.getItem("produtosCatalogoNexon") || "[]"
        );

        const novos = [];

        // Remove somente os produtos que esta rotina gerenciava
        antigos.forEach(function(item) {

            if (!item.categoria || !item.produto) return;

            if (catalogo[item.categoria]) {
                catalogo[item.categoria] =
                    catalogo[item.categoria].filter(function(nome) {
                        return nome !== item.produto;
                    });
            }

        });

        produtos.forEach(function(produto) {

            // Produto inativo não aparece no catálogo do cliente
            if (produto.ativo === false) return;

            const categoria =
                String(produto.categoria || "").trim() || "Outros";

            const codigo =
                String(produto.codigo || "").trim() ||
                ("PRD" + String(produto.id).slice(-6));

            const nomeCatalogo = codigo + " - " + produto.nome;

            // Procura a foto que já estava no catálogo
            const registroAntigo = antigos.find(function(item) {
                return (
                    item.produto === nomeCatalogo ||
                    (
                        item.codigo &&
                        String(item.codigo) === String(codigo)
                    )
                );
            });

            // Nunca substitui uma foto existente por uma informação vazia
            const fotoAtual = String(produto.foto || "").trim();
            const fotoAntiga = registroAntigo
                ? String(registroAntigo.foto || "").trim()
                : "";

            const fotoFinal = fotoAtual || fotoAntiga;

            if (!catalogo[categoria]) {
                catalogo[categoria] = [];
            }

            if (!catalogo[categoria].includes(nomeCatalogo)) {
                catalogo[categoria].push(nomeCatalogo);
            }

            novos.push({
                categoria: categoria,
                produto: nomeCatalogo,
                codigo: codigo,
                nome: produto.nome,
                foto: fotoFinal
            });

        });

        // Grava a lista atualizada sem perder as fotos preservadas
        localStorage.setItem(
            "produtosCatalogoNexon",
            JSON.stringify(novos)
        );

        if (typeof carregarCategorias === "function") {
            carregarCategorias();
        }

        if (typeof carregarProdutosOrcamento === "function") {
            carregarProdutosOrcamento();
        }

        return true;

    } catch (erro) {

        console.error("Erro ao sincronizar catálogo:", erro);

        alert(
            "Não foi possível atualizar o catálogo. " +
            "Os dados anteriores foram mantidos no armazenamento."
        );

        return false;
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
