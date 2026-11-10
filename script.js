const S = JSON.parse(document.getElementById('data').textContent);

let isAdmin = false;
let filt = { q: "", c: "" };
let cover = "";

const $ = s => document.querySelector(s);

const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[c]));

const brl = n => Number(n).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const safe = u => /^https?:\/\//i.test(u || "") ? u : "";

const toast = m => {
    const t = $("#toast");
    t.textContent = m;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.textContent = "", 3500);
};

const tabs = [
    ["inicio", "Início"],
    ["catalogo", "Catálogo"],
    ["sobre", "Sobre"],
    ["contato", "Contato"]
];

const route = () => {
    let r = (location.hash || "#inicio").slice(1);

    if (r === "admin" && !isAdmin) r = "inicio";

    return tabs.some(t => t[0] === r) || r === "admin"
        ? r
        : "inicio";
};


// CARTÕES DOS E-BOOKS

function cardHtml(b) {

    const img = b.cover
        ? `<img class="cover" src="${esc(b.cover)}" alt="Capa de ${esc(b.title)}">`
        : `<div class="ph">${esc(b.title)}</div>`;

    const l = safe(b.link);

    return `
        <article class="card">

            ${img}

            <div class="cb">

                <span class="cat">
                    ${esc(b.cat || "E-book")}
                </span>

                <h3>${esc(b.title)}</h3>

                <span class="au">
                    ${esc(b.author)}
                </span>

                <p class="ds">
                    ${esc(b.desc)}
                </p>

                <div class="pr">

                    <b>${brl(b.price)}</b>

                    ${l
                        ? `<a class="btn sm" href="${esc(l)}" target="_blank" rel="noopener">Comprar</a>`
                        : `<span class="au">Em breve</span>`
                    }

                </div>

            </div>

        </article>
    `;
}


// LINK DE CONTATO

function contactHref(c) {

    c = (c || "").trim();

    if (safe(c)) return c;

    if (c.includes("@")) return "mailto:" + c;

    const d = c.replace(/\D/g, "");

    return d.length >= 10
        ? "https://wa.me/" + d
        : "";
}


// RENDERIZAÇÃO DAS PÁGINAS

function render() {

    const r = route();
    const st = S.store;

    document.title = st.name;

    $("#bar").innerHTML = `
        <a class="logo" href="#inicio">
            ${esc(st.name)}
        </a>

        <nav>
            ${tabs.map(t => `
                <a href="#${t[0]}" class="${r === t[0] ? "on" : ""}">
                    ${t[1]}
                </a>
            `).join("")}

            ${isAdmin ? `
                <a href="#admin" class="adm ${r === "admin" ? "on" : ""}">
                    ⚙ Painel ADM
                </a>
            ` : ""}
        </nav>
    `;

    $("#foot").innerHTML = `
        <div class="footer-inner">
            <div>
                <div class="footer-brand">${esc(st.name)}</div>
                <p>${esc(st.tagline)}</p>
            </div>

            <div>
                © ${new Date().getFullYear()} ${esc(st.name)}. Todos os direitos reservados.
            </div>
        </div>
    `;

    const A = $("#app");


    // INÍCIO

    if (r === "inicio") {

        const n = S.books.slice(-4).reverse();

        A.innerHTML = `
            <section class="hero">

                <div class="hero-content">

                    <span class="eyebrow">
                        Conhecimento que acompanha você
                    </span>

                    <h1>${esc(st.name)}</h1>

                    <p>${esc(st.tagline)}</p>

                    <div class="hero-actions">

                        <a class="btn" href="#catalogo">
                            Explorar catálogo
                            <span aria-hidden="true">↗</span>
                        </a>

                        <a class="btn ghost" href="#sobre">
                            Conheça a loja
                        </a>

                    </div>

                    <div class="hero-note">
                        Leitura digital, novas ideias e aprendizado no seu ritmo.
                    </div>

                </div>

            </section>


            <section class="benefits" aria-label="Vantagens da loja">

                <div class="benefit">
                    <span class="benefit-icon" aria-hidden="true">▤</span>

                    <div>
                        <strong>100% digital</strong>
                        <small>Seus livros em formato eletrônico</small>
                    </div>
                </div>

                <div class="benefit">
                    <span class="benefit-icon" aria-hidden="true">✦</span>

                    <div>
                        <strong>Conteúdo selecionado</strong>
                        <small>Temas para aprender e evoluir</small>
                    </div>
                </div>

                <div class="benefit">
                    <span class="benefit-icon" aria-hidden="true">↗</span>

                    <div>
                        <strong>Acesso simples</strong>
                        <small>Compra pelo link de cada e-book</small>
                    </div>
                </div>

            </section>


            <div class="section-head">

                <div>
                    <span class="section-kicker">Escolhas da loja</span>
                    <h2>Novidades</h2>
                </div>

                <a class="section-link" href="#catalogo">
                    Ver catálogo completo →
                </a>

            </div>

            ${n.length
                ? `<div class="grid">${n.map(cardHtml).join("")}</div>`
                : `<p class="empty">Em breve, novos e-books por aqui.</p>`
            }
        `;


    // CATÁLOGO

    } else if (r === "catalogo") {

        const cats = [
            ...new Set(
                S.books.map(b => b.cat).filter(Boolean)
            )
        ].sort();

        A.innerHTML = `
            <div class="page-intro">

                <span class="section-kicker">
                    Encontre sua próxima leitura
                </span>

                <h2>Nosso catálogo</h2>

                <p>
                    Explore os e-books disponíveis, pesquise por título ou autor
                    e escolha o conteúdo que combina com você.
                </p>

            </div>


            <div class="tools">

                <input
                    id="q"
                    placeholder="Buscar por título ou autor…"
                    value="${esc(filt.q)}"
                >

                <select id="c">

                    <option value="">
                        Todas as categorias
                    </option>

                    ${cats.map(c => `
                        <option ${c === filt.c ? "selected" : ""}>
                            ${esc(c)}
                        </option>
                    `).join("")}

                </select>

            </div>

            <div id="list"></div>
        `;

        const draw = () => {

            const q = filt.q.toLowerCase();

            const L = S.books.filter(b =>
                (!filt.c || b.cat === filt.c) &&
                (b.title + " " + b.author).toLowerCase().includes(q)
            );

            $("#list").innerHTML = L.length
                ? `<div class="grid">${L.map(cardHtml).join("")}</div>`
                : `<p class="empty">Nenhum e-book encontrado.</p>`;
        };

        draw();

        $("#q").oninput = e => {
            filt.q = e.target.value;
            draw();
        };

        $("#c").onchange = e => {
            filt.c = e.target.value;
            draw();
        };


    // SOBRE

    } else if (r === "sobre") {

        A.innerHTML = `
            <div class="page-intro">

                <span class="section-kicker">
                    Nossa proposta
                </span>

                <h2>Sobre nós</h2>

                <p class="prose">
                    ${esc(st.about)}
                </p>

            </div>
        `;


    // CONTATO

    } else if (r === "contato") {

        const h = contactHref(st.contact);

        A.innerHTML = `
            <div class="page-intro">

                <span class="section-kicker">
                    Estamos por aqui
                </span>

                <h2>Fale com a gente</h2>

                <p class="prose">
                    Dúvidas sobre algum e-book? Fale com a gente.
                </p>

                <p style="margin-top:16px">

                    ${h
                        ? `<a class="btn" href="${esc(h)}" target="_blank" rel="noopener">
                            Entrar em contato
                           </a>`
                        : esc(st.contact)
                    }

                </p>

            </div>
        `;


    // PAINEL ADMINISTRATIVO

    } else {

        adminView(A);

    }
}


// PAINEL ADM

function adminView(A) {

    A.innerHTML = `

        <h2>Painel ADM</h2>

        <p class="note">
            Somente você vê esta aba. Visitantes só enxergam
            a vitrine e não conseguem alterar nada:
            qualquer mudança precisa ser publicada pela sua conta.
        </p>


        <h3 style="margin-bottom:12px">
            Adicionar e-book
        </h3>


        <div class="form">

            <div>
                <label>Título *</label>
                <input id="t">
            </div>

            <div>
                <label>Autor</label>
                <input id="a">
            </div>

            <div>
                <label>Categoria</label>
                <input id="k" placeholder="Ex.: Finanças">
            </div>

            <div>
                <label>Preço (R$) *</label>
                <input id="p" inputmode="decimal" placeholder="29,90">
            </div>

            <div class="full">
                <label>
                    Link de compra (Hotmart, Kiwify, Mercado Pago, WhatsApp…)
                </label>

                <input id="l" placeholder="https://…">
            </div>

            <div class="full">
                <label>Descrição</label>
                <textarea id="d" rows="3"></textarea>
            </div>

            <div class="full">
                <label>Capa (imagem)</label>
                <input id="f" type="file" accept="image/*">
            </div>

            <div class="full">
                <button class="btn" id="add">
                    Adicionar e publicar
                </button>
            </div>

        </div>


        <h3 style="margin-bottom:12px">
            E-books publicados (${S.books.length})
        </h3>

        <div id="rows"></div>


        <h3 style="margin:32px 0 12px">
            Dados da loja
        </h3>


        <div class="form">

            <div>
                <label>Nome da loja</label>
                <input id="sn" value="${esc(S.store.name)}">
            </div>

            <div>
                <label>Contato (e-mail, WhatsApp ou link)</label>
                <input id="sc" value="${esc(S.store.contact)}">
            </div>

            <div class="full">
                <label>Frase de destaque</label>
                <input id="sg" value="${esc(S.store.tagline)}">
            </div>

            <div class="full">
                <label>Sobre</label>
                <textarea id="sa" rows="3">${esc(S.store.about)}</textarea>
            </div>

            <div class="full">
                <button class="btn ghost" id="ss">
                    Salvar dados da loja
                </button>
            </div>

        </div>
    `;


    // LISTA DE E-BOOKS

    $("#rows").innerHTML = S.books.length

        ? S.books.map(b => `
            <div class="row">

                ${b.cover
                    ? `<img src="${esc(b.cover)}" alt="">`
                    : `<span class="th"></span>`
                }

                <div>

                    <b>${esc(b.title)}</b>

                    <br>

                    <small>
                        ${esc(b.author)} · ${brl(b.price)}
                    </small>

                </div>

                <button
                    class="btn danger sm"
                    data-id="${esc(b.id)}"
                >
                    Remover
                </button>

            </div>
        `).join("")

        : `<p class="empty">Nenhum e-book ainda.</p>`;


    // CARREGAR CAPA

    $("#f").onchange = async e => {

        const f = e.target.files[0];

        cover = f ? await shrink(f) : "";

    };


    // ADICIONAR E-BOOK

    $("#add").onclick = () => {

        const t = $("#t").value.trim();

        const p = parseFloat(
            $("#p").value.replace(/\./g, "").replace(",", ".")
        );

        if (!t || isNaN(p)) {
            return toast("Preencha título e preço.");
        }

        const l = $("#l").value.trim();

        if (l && !safe(l)) {
            return toast("O link deve começar com https://");
        }

        S.books.push({

            id: Date.now().toString(36),

            title: t,

            author: $("#a").value.trim(),

            cat: $("#k").value.trim(),

            price: p,

            desc: $("#d").value.trim(),

            link: l,

            cover: cover

        });

        cover = "";

        save("E-book adicionado!");

    };


    // REMOVER E-BOOK

    $("#rows").onclick = e => {

        const id = e.target.dataset?.id;

        if (!id) return;

        if (e.target.dataset.sure) {

            S.books = S.books.filter(b => b.id !== id);

            save("E-book removido.");

        } else {

            e.target.dataset.sure = 1;

            e.target.textContent = "Confirmar remoção?";

        }

    };


    // SALVAR DADOS DA LOJA

    $("#ss").onclick = () => {

        S.store = {

            name: $("#sn").value.trim() || "Livraria Digital",

            contact: $("#sc").value.trim(),

            tagline: $("#sg").value.trim(),

            about: $("#sa").value.trim()

        };

        save("Dados salvos!");

    };

}


// REDIMENSIONAR CAPA

function shrink(file) {

    return new Promise(res => {

        const i = new Image();

        i.onload = () => {

            const W = 360;
            const H = 540;

            const c = document.createElement("canvas");

            c.width = W;
            c.height = H;

            const x = c.getContext("2d");

            const s = Math.max(W / i.width, H / i.height);

            const w = i.width * s;
            const h = i.height * s;

            x.drawImage(
                i,
                (W - w) / 2,
                (H - h) / 2,
                w,
                h
            );

            res(c.toDataURL("image/jpeg", .82));

        };

        i.onerror = () => res("");

        i.src = URL.createObjectURL(file);

    });

}


// PUBLICAÇÃO ORIGINAL

async function save(msg) {

    toast("Publicando…");

    try {

        const art = await claude.use("artifact");

        if (!art) {
            return toast("Publicação indisponível nesta visualização.");
        }

        const c = document.documentElement.cloneNode(true);

        c.querySelector("#app").innerHTML = "";
        c.querySelector("#bar").innerHTML = "";
        c.querySelector("#foot").innerHTML = "";
        c.querySelector("#toast").innerHTML = "";

        c.querySelector("#data").textContent =
            JSON.stringify(S).replace(/</g, "\\u003c");

        await art.publish("<!doctype html>\n" + c.outerHTML);

        toast(msg);

    } catch (e) {

        toast(
            e && e.code === "conflict"
                ? "Outra edição foi publicada antes. Recarregando…"
                : "Não foi possível publicar: só o dono da página pode alterar."
        );

    }

}


// INICIALIZAÇÃO

window.addEventListener("hashchange", render);

render();

(async () => {

    try {

        const u = await claude.use("user");

        if (u && u.isOwner()) {

            isAdmin = true;

            render();

        }

    } catch (e) {}

})();