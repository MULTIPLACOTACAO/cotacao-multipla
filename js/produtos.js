/* ======================================================
   NEXON CRM
   MÓDULO DE PRODUTOS
====================================================== */
let produtos = JSON.parse(localStorage.getItem("produtosCRM")) || [];

let produtoEditando = -1;

/* ==========================================
   SALVAR BANCO

========================================== */
/* ==========================================
   ARMAZENAMENTO DE FOTOS - INDEXEDDB
========================================== */

const BANCO_FOTOS = "MultiplaFotosDB";
const TABELA_FOTOS = "fotosProdutos";

function abrirBancoFotos() {
    return new Promise(function(resolve, reject) {
        const requisicao = indexedDB.open(BANCO_FOTOS, 1);

        requisicao.onupgradeneeded = function(evento) {
            const banco = evento.target.result;

            if (!banco.objectStoreNames.contains(TABELA_FOTOS)) {
               
                banco.createObjectStore(TABELA_FOTOS, {
                    keyPath: "id"
                });
            }
        };

        requisicao.onsuccess = function(evento) {
            resolve(evento.target.result);
        };

        requisicao.onerror = function() {
            reject(requisicao.error);
        };
    });
}

async function salvarFotoProduto(id, foto) {
    const banco = await abrirBancoFotos();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            TABELA_FOTOS,
            "readwrite"
        );

        transacao.objectStore(TABELA_FOTOS).put({
            id: String(id),
            foto: foto
        });

        transacao.oncomplete = function() {
            banco.close();
            resolve(true);
        };

        transacao.onerror = function() {
            banco.close();
            reject(transacao.error);
        };
    });
}

async function obterFotoProduto(id) {
    const banco = await abrirBancoFotos();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            TABELA_FOTOS,
            "readonly"
        );

        const requisicao = transacao.objectStore(TABELA_FOTOS)
            .get(String(id));

        requisicao.onsuccess = function() {
            banco.close();
            resolve(requisicao.result ? requisicao.result.foto : "");
        };

        requisicao.onerror = function() {
            banco.close();
            reject(requisicao.error);
        };
    });
}

async function buscarFotoProduto(id) {
    const banco = await abrirBancoFotos();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            TABELA_FOTOS,
            "readonly"
        );

        const requisicao = transacao
            .objectStore(TABELA_FOTOS)
            .get(String(id));

        requisicao.onsuccess = function() {
            banco.close();

            resolve(requisicao.result?.foto || null);
        };

        requisicao.onerror = function() {
            banco.close();
            reject(requisicao.error);
        };
    });
}

async function excluirFotoProduto(id) {
    const banco = await abrirBancoFotos();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            TABELA_FOTOS,
            "readwrite"
        );

        transacao.objectStore(TABELA_FOTOS)
            .delete(String(id));

        transacao.oncomplete = function() {
            banco.close();
            resolve(true);
        };

        transacao.onerror = function() {
            banco.close();
            reject(transacao.error);
        };
    });
}


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


async function salvarProduto() {

    if (salvamentoProdutoEmAndamento) return;

    salvamentoProdutoEmAndamento = true;

    const liberarSalvamento = function() {
        salvamentoProdutoEmAndamento = false;
    };

    try {

        const indice = produtoEditando;

        if (
            indice !== -1 &&
            (
                typeof indice !== "number" ||
                indice < 0 ||
                indice >= produtos.length ||
                !produtos[indice]
            )
        ) {
            alert("Não foi possível localizar o produto para atualizar.");
            return;
        }

        const anterior = indice === -1 ? {} : produtos[indice];

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
            return;
        }

        const id = anterior.id || gerarIdProduto();

        const produto = {
            ...anterior,

            id: id,

            nome: document.getElementById("produtoNome").value.trim(),
            categoria: document.getElementById("produtoCategoria").value.trim(),
            unidade: document.getElementById("produtoUnidade").value.trim(),

            preco: valorPreco === "" ? null : Number(valorPreco),

            custo: document.getElementById("produtoCusto").value.trim() === ""
                ? null
                : Number(document.getElementById("produtoCusto").value),

            codigo: document.getElementById("produtoCodigo").value.trim(),
            descricao: document.getElementById("produtoDescricao").value.trim(),

            ativo: document.getElementById("produtoAtivo").checked
        };

        delete produto.foto;

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

        const codigoNormalizado = produto.codigo.toLowerCase();

        if (codigoNormalizado !== "") {

            const existe = produtos.find(function(p, i) {
                return (
                    i !== indice &&
                    String(p.codigo || "").trim().toLowerCase() === codigoNormalizado
                );
            });

            if (existe) {
                alert(
                    "Já existe um produto com esse código.\n\n" +
                    "Produto: " + existe.nome +
                    "\nCódigo: " + existe.codigo
                );
                return;
            }
        }

        const campoFoto = document.getElementById("produtoFoto");
        const arquivo = campoFoto?.files?.[0];

        if (arquivo) {

            if (!arquivo.type.startsWith("image/")) {
                alert("Selecione um arquivo de imagem válido.");
                return;
            }

            if (arquivo.size > 12 * 1024 * 1024) {
                alert("A imagem deve ter no máximo 12 MB.");
                return;
            }

            const fotoBase64 = await new Promise(function(resolve, reject) {

                const leitor = new FileReader();

                leitor.onerror = function() {
                    reject(new Error("Não foi possível ler a foto."));
                };

                leitor.onload = function(evento) {

                    const imagem = new Image();

                    imagem.onerror = function() {
                        reject(new Error("Não foi possível processar a imagem."));
                    };

                    imagem.onload = function() {

                        try {

                            const limite = 1000;

                            const proporcao = Math.min(
                                1,
                                limite / Math.max(imagem.width, imagem.height)
                            );

                            const canvas = document.createElement("canvas");

                            canvas.width = Math.max(1, Math.round(imagem.width * proporcao));
                            canvas.height = Math.max(1, Math.round(imagem.height * proporcao));

                            const contexto = canvas.getContext("2d");

                            if (!contexto) {
                                reject(new Error("Não foi possível processar a foto."));
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

                            resolve(canvas.toDataURL("image/jpeg", 0.82));

                        } catch (erro) {
                            reject(erro);
                        }
                    };

                    imagem.src = evento.target.result;
                };

                leitor.readAsDataURL(arquivo);
            });

            await salvarFotoProduto(id, fotoBase64);

        } else if (anterior.foto) {

            // Migra uma foto antiga que ainda esteja no cadastro.
            await salvarFotoProduto(id, anterior.foto);
        }

        await finalizarSalvamentoProduto(produto, indice);

        liberarSalvamento();

    } catch (erro) {

        console.error("Erro ao salvar produto:", erro);

        alert(
            "Erro ao salvar produto:\n" +
            (erro.message || erro)
        );

    } finally {

        liberarSalvamento();
    }
}


/* ==========================================
   FINALIZAR SALVAMENTO DO PRODUTO
========================================== */



async function finalizarSalvamentoProduto(produto, indiceProdutoEmEdicao) {

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

    salvarProdutos();

    sincronizarProdutosComCatalogo();

    limparProduto();

    await mostrarProdutos();

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

async function mostrarProdutos() {

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

    const campoPesquisa = document.getElementById("pesquisaProdutos");

    const filtro = (campoPesquisa?.value || "").toLowerCase().trim();

    const filtrados = produtos
        .map((produto, index) => ({ produto, index }))
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
            String(a.produto.nome || "").localeCompare(
                String(b.produto.nome || "")
            )
        );

    for (const { produto, index } of filtrados) {

        let foto = null;

        try {
            if (produto.id) {
                foto = await buscarFotoProduto(produto.id);
            }
        } catch (erro) {
            console.error("Erro ao buscar foto:", produto.id, erro);
        }

        // Compatibilidade temporária com fotos antigas.
        foto = foto || produto.foto || null;

        const preco = produto.preco === null ||
                      produto.preco === undefined ||
                      produto.preco === ""
            ? "Não informado"
            : Number(produto.preco).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        lista.innerHTML += `

        <div class="cliente-card">

            <div class="cliente-header">

                <div style="display:flex; align-items:center; gap:12px;">

                    ${
                        foto
                            ? `
                                <img
                                    src="${foto}"
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
                                <div style="
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

                    <strong>${produto.nome || ""}</strong>

                </div>

                <span>R$ ${preco}</span>

            </div>

            <div class="cliente-info">

                Categoria: ${produto.categoria || "-"}

                <br>

                Unidade: ${produto.unidade || "-"}

                <br>

                Código: ${produto.codigo || "-"}

            </div>

            <div style="display:flex; gap:8px; margin-top:12px;">

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
    }
}

/* ==========================================
   EDITAR PRODUTO
========================================== */




async function editarProduto(index) {

    const produto = produtos[index];

    if (!produto) {
        alert("Não foi possível localizar esse produto.");
        return;
    }

    produtoEditando = index;

    const botaoProdutos = document.getElementById("btnProdutos");
    mostrarTab("produtos", botaoProdutos);

    document.getElementById("produtoNome").value = produto.nome || "";
    document.getElementById("produtoCategoria").value = produto.categoria || "";
    document.getElementById("produtoUnidade").value = produto.unidade || "";
    document.getElementById("produtoPreco").value = produto.preco ?? "";
    document.getElementById("produtoCusto").value = produto.custo ?? "";
    document.getElementById("produtoCodigo").value = produto.codigo || "";
    document.getElementById("produtoDescricao").value = produto.descricao || "";

    document.getElementById("produtoFoto").value = "";

    document.getElementById("produtoAtivo").checked =
        produto.ativo !== false;

    const preview = document.getElementById("previewProdutoFoto");

    if (preview) {

        preview.innerHTML = "";

        try {

            const foto = (
                produto.id
                    ? await buscarFotoProduto(produto.id)
                    : null
            ) || produto.foto || null;

            if (foto) {

                const imagem = document.createElement("img");

                imagem.src = foto;
                imagem.alt = "Foto atual do produto";
                imagem.style.maxWidth = "180px";
                imagem.style.maxHeight = "180px";
                imagem.style.objectFit = "contain";
                imagem.style.borderRadius = "10px";
                imagem.style.marginTop = "8px";

                preview.appendChild(imagem);
            }

        } catch (erro) {
            console.error("Erro ao recuperar foto para edição:", erro);
            alert("Não foi possível carregar a foto atual.");
        }
    }

    document.getElementById("tab-produtos").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================
   EXCLUIR PRODUTO
========================================== */


async function excluirProduto(index) {

    if (index < 0 || index >= produtos.length) {
        return;
    }

    const produto = produtos[index];

    if (!confirm(
        'Deseja realmente excluir o produto "' +
        (produto.nome || "") + '"?'
    )) {
        return;
    }

    try {

        if (produto.id) {
            await excluirFotoProduto(produto.id);
        }

        produtos.splice(index, 1);

        salvarProdutos();

        sincronizarProdutosComCatalogo();

        await mostrarProdutos();

    } catch (erro) {

        console.error("Erro ao excluir produto:", erro);

        alert("Não foi possível excluir o produto.");
    }
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
    if (typeof catalogo === "undefined") return false;
if (!Array.isArray(produtos) || produtos.length === 0) {
    console.warn(
        "Sincronização cancelada: cadastro de produtos vazio."
    );
    return false;
}
    try {
        const antigos = JSON.parse(
            localStorage.getItem("produtosCatalogoNexon") || "[]"
        );

        const novos = [];

        antigos.forEach(function(item) {
            if (!item.categoria || !item.produto) return;

            if (catalogo[item.categoria]) {
                catalogo[item.categoria] =
                    catalogo[item.categoria].filter(
                        nome => nome !== item.produto
                    );
            }
        });

        produtos.forEach(function(produto) {
            if (produto.ativo === false) return;

            const categoria =
                String(produto.categoria || "").trim() || "Outros";

            const codigo =
                String(produto.codigo || "").trim() ||
                ("PRD" + String(produto.id).slice(-6));

            const nomeCatalogo = codigo + " - " + produto.nome;

            if (!catalogo[categoria]) {
                catalogo[categoria] = [];
            }

            if (!catalogo[categoria].includes(nomeCatalogo)) {
                catalogo[categoria].push(nomeCatalogo);
            }

            // Guarda somente identificação, nunca a foto Base64
            novos.push({
                idProduto: produto.id,
                categoria: categoria,
                produto: nomeCatalogo,
                codigo: codigo,
                nome: produto.nome
            });
        });

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
        alert("Erro ao atualizar o catálogo: " + erro.message);
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
