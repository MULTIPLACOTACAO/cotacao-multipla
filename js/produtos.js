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

        foto: document.getElementById("produtoFoto").value.trim(),

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

    salvarProdutos();

    limparProduto();

    mostrarProdutos();

}
/* ==========================================
   MOSTRAR PRODUTOS
========================================== */

function mostrarProdutos() {

    const lista = document.getElementById("listaProdutos");

    if (!lista) return;

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

function salvarProduto() {

    const produto = {

        id: produtoEditando === -1
            ? gerarIdProduto()
            : produtos[produtoEditando].id,

        nome: document.getElementById("produtoNome").value.trim(),

        categoria: document.getElementById("produtoCategoria").value.trim(),

        unidade: document.getElementById("produtoUnidade").value.trim(),

        preco: parseFloat(document.getElementById("produtoPreco").value) || 0,

        custo: parseFloat(document.getElementById("produtoCusto").value) || 0,

        codigo: document.getElementById("produtoCodigo").value.trim(),

        foto: document.getElementById("produtoFoto").value.trim(),

        descricao: document.getElementById("produtoDescricao").value.trim(),

        ativo: document.getElementById("produtoAtivo").checked

    };

    if (produto.nome === "") {
        alert("Informe o nome do produto.");
        return;
    }

    produtos.push(produto);

    salvarProdutos();

    limparProduto();

    if (typeof mostrarProdutos === "function") {
        mostrarProdutos();
    }

    alert("Produto cadastrado com sucesso!");

}
