import Image from "next/image";
import Link from "next/link";

const CATALOG = [
  { label: "Chuteiras Campo", href: "/categoria/campo" },
  { label: "Chuteiras Society", href: "/categoria/society" },
  { label: "Chuteiras Futsal", href: "/categoria/futsal" },
  { label: "Tênis de Corrida", href: "/categoria/corrida" },
  { label: "Camisas Oficiais", href: "/categoria/camisas" },
  { label: "Meias", href: "/categoria/meias" },
];
const BRANDS = [
  { label: "Nike", href: "/nike" },
  { label: "Adidas", href: "/adidas" },
  { label: "Puma", href: "/puma" },
  { label: "Umbro", href: "/umbro" },
  { label: "New Balance", href: "/new-balance" },
];
const SUPPORT = [
  { label: "Trocas e Devoluções", href: "/politica-trocas" },
  { label: "Rastrear Pedido", href: "/conta/pedidos" },
  { label: "Tabela de Tamanhos", href: "/tamanhos" },
  { label: "Política de Privacidade", href: "/privacidade" },

  { label: "Termos de Uso", href: "/termos" },
  { label: "Fale Conosco", href: "/contato" },
];

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <Image
                src="/logo.svg"
                alt="Galvão's Store"
                width={48}
                height={48}
                style={{ borderRadius: "50%" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-stencil)",
                    fontSize: 22,
                    color: "var(--brand-orange)",
                    letterSpacing: ".04em",
                    lineHeight: 1,
                  }}
                >
                  GALVÃO&apos;S
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: ".2em",
                    color: "var(--ink-500)",
                  }}
                >
                  ALTA PERFORMANCE
                </div>
              </div>
            </Link>
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
                <li key={i.label}>
                  <Link href={i.href}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Marcas</h4>
            <ul>
              {BRANDS.map((b) => (
                <li key={b.label}>
                  <Link href={b.href}>{b.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Atendimento</h4>
            <ul>
              {SUPPORT.map((i) => (
                <li key={i.label}>
                  <Link href={i.href}>{i.label}</Link>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 20 }}>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "5511999999999"}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "#25D366",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-ui)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
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
