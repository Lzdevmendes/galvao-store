import Link from "next/link";

const CATALOG = [
  "Chuteiras Campo",
  "Chuteiras Society",
  "Chuteiras Futsal",
  "Tênis de Corrida",
  "Camisas Oficiais",
  "Meias",
];
const BRANDS = ["Nike", "Adidas", "Puma", "Umbro", "New Balance"];
const SUPPORT = [
  "Trocas e Devoluções",
  "Rastrear Pedido",
  "Tabela de Tamanhos",
  "Política de Privacidade",
  "Termos de Uso",
];

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div
              style={{
                fontFamily: "var(--font-stencil)",
                fontSize: 36,
                color: "var(--brand-orange)",
                letterSpacing: ".04em",
                marginBottom: 12,
              }}
            >
              GALVÃO&apos;S
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-400)",
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              Chuteiras de alta performance para quem leva o jogo a sério. Nike,
              Adidas, Puma e muito mais.
            </p>
          </div>

          <div>
            <h4>Catálogo</h4>
            <ul>
              {CATALOG.map((i) => (
                <li key={i}>
                  <a href="#">{i}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Marcas</h4>
            <ul>
              {BRANDS.map((b) => (
                <li key={b}>
                  <Link href={`/${b.toLowerCase().replace(" ", "-")}`}>
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Atendimento</h4>
            <ul>
              {SUPPORT.map((i) => (
                <li key={i}>
                  <a href="#">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="legal">
          <span>© 2026 Galvão&apos;s Store · CNPJ 00.000.000/0001-00</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["Pix", "Visa", "Master", "Boleto"].map((m) => (
              <span
                key={m}
                style={{
                  padding: "3px 8px",
                  background: "var(--ink-800)",
                  color: "var(--ink-300)",
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
