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
