// Generador del PDF Harvard (clon de la plantilla CV-Harvard-Espanol).
// Se importa con dynamic import: @react-pdf/renderer pesa, y solo se carga
// cuando el usuario pulsa "Descargar PDF". Texto real (ATS-friendly).
import { Document, Link, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { BloqueCv, ContactoCv, CvAdaptado, SeccionCv } from "@/lib/types";

// Las lineas auditables llevan un Link invisible con esta URI; el visor
// (PdfPreview) intercepta el clic y muestra el origen. La preview ES el PDF.
export const AUDIT_SCHEME = "https://audit.jano.local/";

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000",
    lineHeight: 1.3,
  },
  nombre: { fontSize: 17, fontFamily: "Helvetica-Bold", textAlign: "center" },
  contacto: { fontSize: 9.5, textAlign: "center", marginTop: 3, color: "#222" },
  regla: { borderBottomWidth: 1.4, borderBottomColor: "#000", marginTop: 7, marginBottom: 9 },
  perfil: { fontSize: 10, textAlign: "justify", lineHeight: 1.3 },
  seccionTitulo: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 11,
    marginBottom: 4,
  },
  filaBloque: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  empresa: { fontSize: 10, textTransform: "uppercase" },
  derecha: { fontSize: 10, textAlign: "right" },
  filaPuesto: { flexDirection: "row", justifyContent: "space-between" },
  puesto: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  fechas: { fontSize: 10, textAlign: "right" },
  bulletFila: { flexDirection: "row", marginTop: 2, paddingLeft: 14 },
  bulletPunto: { width: 11, fontSize: 10 },
  bulletTexto: { flex: 1, fontSize: 10, lineHeight: 1.28 },
  grupoCategoria: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 4 },
  grupoItems: { fontSize: 10, textAlign: "center" },
});

function lineaContacto(c: ContactoCv): string {
  return [c.telefono, c.email, c.ciudad, c.linkedin].filter(Boolean).join("  ●  ");
}

function Bloque({ b, si, bi, conBullets }: { b: BloqueCv; si: number; bi: number; conBullets: boolean }) {
  return (
    <View wrap={false}>
      <View style={s.filaBloque}>
        <Text style={s.empresa}>{b.empresa ?? ""}</Text>
        <Text style={s.derecha}>{b.ubicacion ?? ""}</Text>
      </View>
      <View style={s.filaPuesto}>
        <Text style={s.puesto}>{b.puesto ?? ""}</Text>
        <Text style={s.fechas}>{b.fechas ?? ""}</Text>
      </View>
      {conBullets &&
        (b.bullets ?? []).map((bu, i) => (
          <View key={i} style={s.bulletFila}>
            <Text style={s.bulletPunto}>{"•"}</Text>
            <Link
              src={`${AUDIT_SCHEME}b?si=${si}&bi=${bi}&bu=${i}`}
              style={{ ...s.bulletTexto, color: "#000", textDecoration: "none" }}
            >
              {bu.texto}
            </Link>
          </View>
        ))}
    </View>
  );
}

function Seccion({ sec, si }: { sec: SeccionCv; si: number }) {
  return (
    <View>
      <Text style={s.seccionTitulo}>{sec.titulo.toUpperCase()}</Text>
      {(sec.bloques ?? []).map((b, i) => (
        <Bloque key={i} b={b} si={si} bi={i} conBullets={sec.tipo === "experiencia" || sec.tipo === "otros"} />
      ))}
      {(sec.grupos ?? []).map((g, i) => (
        <View key={i} wrap={false}>
          <Text style={s.grupoCategoria}>{g.categoria}</Text>
          <Text style={s.grupoItems}>{g.items.join(", ")}</Text>
        </View>
      ))}
      {(sec.bullets ?? []).map((bu, i) => (
        <View key={i} style={s.bulletFila}>
          <Text style={s.bulletPunto}>{"•"}</Text>
          <Text style={s.bulletTexto}>{bu.texto}</Text>
        </View>
      ))}
    </View>
  );
}

const ORDEN: Record<string, number> = { experiencia: 2, habilidades: 1, educacion: 3, certificaciones: 4, otros: 5 };

function CvDoc({ cv, contacto }: { cv: CvAdaptado; contacto: ContactoCv }) {
  // El indice si de cada seccion es el de cv.secciones SIN ordenar, para que
  // el clic de auditoria del visor apunte al mismo objeto del estado.
  const conIndice = cv.secciones.map((sec, si) => ({ sec, si }));
  conIndice.sort((a, b) => (ORDEN[a.sec.tipo] ?? 9) - (ORDEN[b.sec.tipo] ?? 9));
  return (
    <Document title={`CV ${contacto.nombre}`} author={contacto.nombre}>
      <Page size="A4" style={s.page}>
        <Text style={s.nombre}>{contacto.nombre}</Text>
        {lineaContacto(contacto) !== "" && <Text style={s.contacto}>{lineaContacto(contacto)}</Text>}
        <View style={s.regla} />
        <Link src={`${AUDIT_SCHEME}perfil`} style={{ ...s.perfil, color: "#000", textDecoration: "none" }}>
          {cv.perfil}
        </Link>
        {conIndice.map(({ sec, si }) => (
          <Seccion key={si} sec={sec} si={si} />
        ))}
      </Page>
    </Document>
  );
}

// Genera el PDF como blob (lo usan el visor y la descarga: mismo documento).
export async function generarCvBlob(cv: CvAdaptado, contacto: ContactoCv): Promise<Blob> {
  return pdf(<CvDoc cv={cv} contacto={contacto} />).toBlob();
}

// Genera el PDF en el navegador y dispara la descarga.
export async function descargarCvPdf(cv: CvAdaptado, contacto: ContactoCv, empresaOferta?: string) {
  const blob = await generarCvBlob(cv, contacto);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const empresa = empresaOferta ? ` - ${empresaOferta}` : "";
  a.download = `CV - ${contacto.nombre || "Candidato"}${empresa}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
